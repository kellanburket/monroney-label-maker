<?php
define('STAT', '1');
define('REL', '2');
define('ABS', '4');
define('FLEFT', '8');
define('FRIGHT', '16');
define('FIX', '32');
define('BLOCK_', '64');
define('INLINE_BLOCK_', '128');
define('VERTICAL_ALIGN_BOTTOM', '256');
define('VERTICAL_ALIGN_TOP', '512');

define('SET_INLINE_TEXT', '1');

// long : 4.0625
// tall: 10.3125

class PDFAddendumGenerator {

	private $pdf;
	private $flags;
	private $filepath;
	private $views;
	private $tree;
	private $root_id;
	private $pdf_frame;
	private $allowed_image_exts = array('PNG'=>'image/png', 'JPEG'=>'image/jpeg', 'GIF'=>'image/gif');
	
	public function __construct($root_element, $elements, $scale) {
		$this->scale = $scale;
		$this->pdf = new FPDF('P', 'pt', 'A4');
		$this->pdf->AddPage();
		$this->filepath = LABEL_MAKER_ROOT . '/pdfs/test.pdf';
		$this->fileurl = LABEL_MAKER_URL . '/pdfs/test.pdf';
		$this->root_id = $root_element["id"];

		$this->sort_elements($root_element, $elements);
		
		$this->pdf->SetXY(0, 0);
		
		foreach($this->views as &$view) {
			$this->parse_cell_data($view);		
		}


		
		$this->recursive_set($this->tree, $this->root_id);
		
		$this->pdf->Output($this->filepath, 'F');

		$this->return_val = array();
		foreach($this->views as $id=>$view) {
			$this->return_val[$id] = $view;
		}		
				
		echo json_encode($this->return_val);
		exit;
	}
	
	private function sort_elements($root, $els) {
		$this->views = array();

		$this->views[$this->root_id] = $root;
		unset($this->views[$this->root_id]["parent"]);

		foreach ($els as $el) {
			$this->views[$el["id"]] = $el;			
		}
	
		$this->tree = array();
		$this->tree[$this->root_id] = array();
		foreach($this->views as $view) {
			if ($view['parent'] == $this->root_id) {
				$this->tree[$this->root_id][$view['id']] = array();
				$this->build_tree($view, $this->tree[$this->root_id][$view['id']]);
			}
		}
	
	}
	
	private function recursive_set($tree, $id) {
		//$this->set_cell($this->views[$id]);
		if (is_array($tree)) {
			uksort($tree, function($a, $b) {
				if($this->views[$a]['zindex'] > $this->views[$b]['zindex']) {
					return 1;
				} else if($this->views[$a]['zindex'] < $this->views[$b]['zindex']) {
					return -1;
				} else {
					return 1;
				}
			});
		
			foreach($tree as $branch_id=>$branch) {
				$this->set_cell($this->views[$branch_id]);	
				if (is_array($branch)) {
					$this->recursive_set($branch, $branch_id);
				}
			}
		} else {
			$this->set_cell($this->views[$id]);
		}
	}
	
	private function build_tree($view, &$tree) {
		if ($view['children']) {
			foreach($view['children'] as $child) {
				$child_view = $this->views[$child];
				$tree[$child] = array();
				$this->build_tree($child_view, $tree[$child]);
			}
		} else {
			$tree = 'no_children';
		}
	}
	
	private function parse_cell_data(&$cell) {
		$cell["flags"] = 0;
		$cell["tag"] = strtolower($cell["tag"]);

		$cell["zindex"] = intval($cell["zindex"]);
		$cell["fill"] = $this->parse_rgb_color($cell["background"]);
		unset($cell["background"]);
		$cell["text"] = trim($cell["text"]);
		$cell["font"]["family"] = $this->parse_font_family($cell["fontfamily"]);
		$cell["font"]["size"] = $this->parse_pixels($cell["fontsize"]);
		$cell["font"]["style"] = $this->parse_font_style($cell["fontweight"]);
		$cell["font"]["style"] += $this->parse_font_style($cell["fontstyle"]);

		unset($cell['fontweight']);
		unset($cell['fontstyle']);
		unset($cell['fontfamily']);
		unset($cell['fontsize']);
		
		
		if ($cell["font"]["style"] === 0) $cell["font"]["style"] = '';

		
		$cell["color"] = $this->parse_rgb_color($cell["color"]);

		$cell["absolute_position"] = $this->parse_absolute_position($cell["top"], $cell["right"], $cell["bottom"], $cell["left"]);
		unset($cell['top']);
		unset($cell['left']);
		unset($cell['bottom']);
		unset($cell['right']);

		$cell["margin"] = $this->parse_position($cell["margin"]);
		$cell["padding"] = $this->parse_position($cell["padding"]);

		//final w and h defined
		$cell["width"] = $this->parse_pixels($cell["width"]) + $cell["padding"]["left"] + $cell["padding"]["right"];		
		$cell["height"] = $this->parse_pixels($cell["height"]) + $cell["padding"]["top"] + $cell["padding"]["bottom"];	

		$cell["image"] = $this->parse_image_file($cell);			
		//final x and y defined;
		$this->set_position($cell);

		$cell["border"] = $this->parse_border($cell);
		$this->align_text($cell);
	}

	private function parse_border($cell) {
	
		foreach($cell['border'] as $key=>&$border) {
			list($size, $style, $color) = sscanf(trim($border), "%s %s %s");		
			$size = $this->parse_pixels($size);
			if ($size == 0) {
				$border = NULL;
				continue;
			}
			 
			$color = $this->parse_rgb_color($color);
			
			if ($size > 1 || ($color && $color['red'] > 0 && $color['green'] > 0 && $color['blue'] > 0)) {
				switch($key) {
					case('top'):
						$x1 = $cell['x'] + $cell['margin']['left']; 
						$y1 = $cell['y'] + $cell['margin']['top'];
						$x2 = $cell['x'] + $cell['width'] - $cell['margin']['right'];
						$y2 = $cell['y'] + $cell['margin']['top'];
						break;
					case('right'):
						$x1 = $cell['x'] + $cell['width'] - $cell['margin']['right']; 
						$y1 = $cell['y'] + $cell['margin']['top'];
						$x2 = $cell['x'] + $cell['width'] - $cell['margin']['right'];
						$y2 = $cell['y'] + $cell['height'] + $cell['margin']['bottom'];
						break;
					case('bottom'):
						$x1 = $cell['x'] + $cell['margin']['left']; 
						$y1 = $cell['y'] + $cell['height'] - $cell['margin']['bottom'];
						$x2 = $cell['x'] + $cell['width'] - $cell['margin']['right'];
						$y2 = $cell['y'] + $cell['height'] - $cell['margin']['bottom'];
						break;
					case('left'):
						$x1 = $cell['x'] + $cell['margin']['left']; 
						$y1 = $cell['y'] + $cell['margin']['top'];
						$x2 = $cell['x'] + $cell['margin']['left'];
						$y2 = $cell['y'] + $cell['height'] - $cell['margin']['bottom'];
						break;
				}

				$border = array(
					'color'=>$color, 
					'width'=>$size,
					'side'=>$key,
					'x1'=>$x1, 
					'y1'=>$y1, 
					'x2'=>$x2,
					'y2'=>$y2
				);
				
			} else {
				$border = $key; 
			}
		
		}
		return $cell['border'];
	}
	
	private function convert_side_to_string($side) {
		switch($side) {
			case('top'): return 'T';
			case('right'): return 'R';
			case('bottom'): return 'B';
			case('left'): return 'L';			
			default: return '';
		}
	}

	private function parse_image_file($cell) {
		if (array_key_exists('image', $cell) && $cell['image']) {
			$finfo = new finfo(FILEINFO_MIME_TYPE);
			
			$file_name = preg_match("/.*\/(.*?\.*$)/", $cell['image'], $matches);
			$file_path = LABEL_MAKER_UPLOADS.'/'.$matches[1];

			$file_type = $finfo->file($file_path);
			
			$approved_type = false;
			foreach($this->allowed_image_exts as $key=>$mime_type) {
				if ($file_type == $mime_type) {
					$approved_type = $key;
				}			
			}
			if ($approved_type) {		
				return array(
					'file' => $file_path,
					'mime' => $approved_type
				);
			} else {
				echo json_encode(array('file_path'=> $file_path, 'message'=> $file_type . ' is not an approved image type. Please upload a .GIF, .JPG, or, .PNG.'));
				exit;
			}
		} else {
			return NULL;
		}
	}

	private function align_text(&$cell) {
		if (preg_match('/center/i', $cell['textalign'])) {
			$cell['alignment'] = 'C';
		} elseif (preg_match('/right/i', $cell['textalign'])) {
			$cell['alignment'] = 'R';			
		}
	}

	private function parse_font_style($style) {
		if (preg_match('/bold/i', $style)) return 'B';
		else if (preg_match('/normal/i', $style)) return '';
		else if (preg_match('/italic/i', $style)) return 'I';
		else if (preg_match('/underline/i', $style)) return 'U';
		else if (is_numeric($style) && intval($style) < 700) return '';
		else if (is_numeric($style) && intval($style) > 700) return 'B';
		else return '';
	}

	private function parse_absolute_position($top, $right, $bottom, $left) {
		$top = ($top == 'auto') ? NULL : $top;
		$bottom = ($bottom == 'auto') ? NULL : $bottom;
		$left = ($left == 'auto') ? NULL : $left;
		$right = ($right == 'auto') ? NULL : $right;
		
		return array(
			"top" => ($top || $top == "0" || $top === 0) ? $this->parse_pixels($top) : NULL,
			"right" => ($right || $right == "0" || $right === 0) ? $this->parse_pixels($right) : NULL,
			"bottom" => ($bottom || $bottom == "0" || $bottom === 0) ? $this->parse_pixels($bottom) : NULL,
			"left" => ($left || $left == "0" || $left === 0) ? $this->parse_pixels($left) : NULL,			
		);
	}


	private function add_sibling_to_x_stack($sibling) {
		return $sibling["width"] + $sibling["margin"]["left"] + $sibling["margin"]["right"];
	}
	
	private function add_sibling_to_y_stack($sibling) {
		return $sibling["height"] + $sibling["margin"]["bottom"] + $sibling["margin"]["top"];
	}

	private function float_left(&$cell, $parent) {
		$cell['y'] += $parent['y'];
		$cell['x'] += $parent['x'];
		$cell['position_flags'] |= FLEFT;
	}

	private function float_right(&$cell, $parent) {
		$cell['y'] += $parent['y'];
		$cell['x'] += $parent['width'] - $cell['width'];
		$cell['position_flags'] |= FRIGHT;
	}

	private function set_position(&$cell) {
		//$position, $display, &$margin, $parent = NULL, $siblings = NULL
		$cell['display'] = ($cell['display'] == 'list-item') ? 'block' : $cell['display'];
		$cell['display'] = ($cell['display'] == 'inline') ? 'inline-block' : $cell['display'];
		$cell['display'] = preg_match('/span/i', trim($cell['tag'])) ? 'inline' : $cell['display'];
		//$cell['display'] = ($cell['float'] == 'left' || $cell['float'] == 'right') ? 'block' : $cell['display'];

		$cell['position_flags'] = 0;

		$cell["x"] = $cell["margin"]["left"];
		$cell["y"] = $cell["margin"]["top"];

		if (array_key_exists('float', $cell)) {
			if (array_key_exists('parent', $cell) && array_key_exists($cell['parent'], $this->views)) {	
				$parent = $this->views[$cell['parent']];
				switch($cell['float']) {
					case ('left'):
						$this->float_left($cell, $parent);
						break;
					case ('right'):
						$this->float_right($cell, $parent);
						break;
					case ('inherit'): 
						if ($this->views[$cell['parent']]['position_flags'] & FLEFT) {
							$this->float_left($cell, $parent);
						}
						else if ($this->views[$cell['parent']]['position_flags'] & FLEFT) {
							$this->float_right($cell, $parent);
						}
						break;
					default:
						$cell['y'] += $parent['y'];
						$cell['x'] += $parent['x'];
						break;
				}
			}
		}
		
		unset($cell['float']);
		if (array_key_exists('parent', $cell)) {
			if (array_key_exists($cell['parent'], $this->views)) {	
				$parent = $this->views[$cell['parent']];
				switch($cell['position']) {
					case('static'):
						$cell['position_flags'] |= STAT;
						$this->set_static_position($cell, $parent);
						break;
					case('relative'):
						$cell['position_flags'] |= REL;
						$this->set_static_position($cell, $parent);
						break;
					case('absolute'):
						$cell['position_flags'] |= ABS;
						$this->set_absolute_position($cell);
						break;
					case('fixed'):
						$cell['position_flags'] |= FIX;
						$this->set_absolute_position($cell);
						break;
					default:
				}
			}
		}
				
				
		//$this->pdf->SetXY($cell["x"], $cell["y"]);
	}
	
	private function set_static_position(&$cell, $parent) {
		//unset($cell['tag']);

		$cell["x"] += $parent["padding"]["left"] + $parent["border"]["left"]["width"];
		$cell["y"] += $parent["padding"]["top"] + $parent["border"]["top"]["width"];
		/*
		if (array_key_exists('verticalalign', $cell)) {
			switch($cell['verticalalign']) {
				case('top'):
								
				break;
			}
		}
		*/
		if (array_key_exists('siblings', $cell) && is_array($cell['siblings'])) {
			
			if(!($cell["position_flags"] & FRIGHT) && !($cell["position_flags"] & FLEFT)) {
				switch($cell['display']) {
					case('block'):
						foreach($cell['siblings'] as $sibling_id) {
							$sibling = $this->views[$sibling_id];
							if ( ($sibling["position_flags"] & (REL | STAT)) && !(($sibling["position_flags"] & (FLEFT | FRIGHT)))) {
								$cell["y"] += $this->add_sibling_to_y_stack($sibling);
							}
						}
						break;
					case('inline-block'):
						foreach($cell['siblings'] as $sibling_id) {
							$sibling = $this->views[$sibling_id];	
							if ( ($sibling["position_flags"] & (REL | STAT)) && !(($sibling["position_flags"] & (FLEFT | FRIGHT)))) {
								switch($sibling["display"]) {
									case('block'):
										$cell["y"] += $this->add_sibling_to_y_stack($sibling);
										break;								
									case('inline-block'):
										$cell["x"] += $this->add_sibling_to_x_stack($sibling);
										break;
								}
							}
						}
						break;
				}
			} else  {
				//if ($cell['display'] == 'inline');
				$parent = $this->views[$cell['parent']];
				$cell['left_offset'] = 0;
				$cell['right_offset'] = 0;
				$cell['text_width'] = $cell['width'];
				if (array_key_exists('siblings', $cell) && is_array($cell['siblings'])) {
					foreach($cell['siblings'] as $sibling_id) {
						$sibling = $this->views[$sibling_id];
						if (array_key_exists('text_width', $sibling) && !($sibling['position_flags'] & FRIGHT)) {
							$cell['left_offset'] += $sibling['text_width'];								
						} else if (array_key_exists('right_offset', $sibling) && ($sibling['position_flags'] & FRIGHT)) {
							$cell['right_offset'] += $sibling['text_width'];																
						}
					}
				}
				
				
				
				$cell['x'] = $parent['x'];
				$cell['y'] = $parent['y'] + $parent['padding']['top'];					
				
				if ($cell['position_flags'] & FRIGHT) {
					$cell['width'] = $parent['width'] - $parent['padding']['right'];
					$cell['alignment'] = 'R';
				} else {
					$cell['width'] = $parent['width'] - $parent['padding']['left'];
					$cell['flags'] |= SET_INLINE_TEXT;			
				}
			}
		}
	}
	
	private function set_relative_position(&$cell, $parent) {
		$this->set_static_position($cell, $parent);
	}
	
	private function set_absolute_position(&$cell) {
		//$parent = $this->get_nearest_containing_parent($cell);
		if (array_key_exists('parent', $cell)) {
			if (array_key_exists($cell['parent'], $this->views)) {	
				$parent = $this->views[$cell['parent']];
			}
		} else {
			$parent = array();
			$parent['height'] = 0;
			$parent['width'] = 0;
			$parent["border"]["left"]["width"] = 0;
			$parent["border"]["right"]["width"] = 0;
			$parent["border"]["top"]["width"] = 0;
			$parent["border"]["bottom"]["width"] = 0;
		}
		
		if(!is_null($cell["absolute_position"]["top"]) && is_null($cell["absolute_position"]["bottom"])) {
			$cell['y'] += $cell["absolute_position"]["top"] + $parent["border"]["top"]["width"];
		} else if(!is_null($cell["absolute_position"]["top"]) && !is_null($cell["absolute_position"]["bottom"])) {
			$cell['y'] += $cell["absolute_position"]["top"] + $parent["border"]["top"]["width"];
		} else if(is_null($cell["absolute_position"]["top"]) && !is_null($cell["absolute_position"]["bottom"])) {
			$cell['y'] += $parent['height'] - $parent['margin']['bottom'] - $parent["margin"]["top"] - $cell["absolute_position"]["bottom"] - $parent["border"]["bottom"]["width"];
		} else {
		}

		if(!is_null($cell["absolute_position"]["left"]) && is_null($cell["absolute_position"]["right"])) {
			$cell['x'] += $cell["absolute_position"]["left"] + $parent["border"]["left"]["width"];
		} else if(!is_null($cell["absolute_position"]["left"]) && !is_null($cell["absolute_position"]["right"])) {
			$cell['x'] += $cell["absolute_position"]["left"] + $parent["border"]["left"]["width"];
		} else if(is_null($cell["absolute_position"]["left"]) && !is_null($cell["absolute_position"]["right"])) {
			$cell['x'] += $parent['width'] - $parent['margin']['right'] - $parent["margin"]["left"] - $cell["absolute_position"]["right"] - $parent["border"]["right"]["width"];
		} else {
		}
	}
	
	private function get_nearest_containing_parent(&$cell) {
		if(array_key_exists($cell['parent'], $this->views)) {
			if ($cell['parent'] == $this->root_id) {
				return $this->views[$this->root_id];		
			}
			
			$parent = $this->views[$cell['parent']];
	
			if (!$parent) {
				return $this->views[$this->root_id];
			}
			
			if (!($parent['position_flags'] & ABS) || !($parent['position_flags'] & REL) || !($parent['position_flags'] & FIX)) {
				return $this->get_nearest_containing_parent($parent);
			} else {
				return $parent;
			}
		} else {
			return $cell;
		}
	}
	
	private function parse_font_family($font) {
		if (preg_match('/arial|sans-serif|helvetica/i', $font)) return 'Arial';
		else if (preg_match('/times|garamond|georgia|serif/i', $font)) return 'Times';	
		else if (preg_match('/courier|monaco|lucida|mono|/i', $font)) return 'Courier';	
		else return 'Arial';
	}
	
	private function parse_pixels($dim) {
		preg_match('/(-|)\d+/', $dim, $matches);
		return $this->pixels_to_points($matches[0]) / $this->scale;
	}
	
	private function parse_rgb_color($color) {
		preg_match_all('/\d{1,3}/i', $color, $matches);
		if (count($matches[0]) == 4) {
			return false;
		} else if (count($matches[0]) == 3) {			
			return array(
				'red' => intval($matches[0][0]),
				'green' => intval($matches[0][1]),
				'blue' => intval($matches[0][2])
			);
		}
	}
	
	private function parse_position($pos) {
		$temp = explode(' ', $pos);
		switch (count($temp)) {
			case (1):
				$top = $this->parse_pixels($temp[0]);
				return array('top'=>$top, 'right'=>$top, 'bottom'=>$top, 'left'=>$top);
			case (2):
				$top = $this->parse_pixels($temp[0]);
				$right = $this->parse_pixels($temp[1]);
				return array('top'=>$top, 'right'=>$right, 'bottom'=>$top, 'left'=>$right);
			case (3):
				$top = $this->parse_pixels($temp[0]);
				$right = $this->parse_pixels($temp[1]);	
				$bottom = $this->parse_pixels($temp[2]);	
				return array('top'=>$top, 'right'=>$right, 'bottom'=>$bottom, 'left'=>$right);
			case (4):
				$top = $this->parse_pixels($temp[0]);
				$right = $this->parse_pixels($temp[1]);	
				$bottom = $this->parse_pixels($temp[2]);	
				$left = $this->parse_pixels($temp[3]);	
				return array('top'=>$top, 'right'=>$right, 'bottom'=>$bottom, 'left'=>$left);
			default: 			
				echo json_encode(array('Failure'=>'Fail'));
				exit;
		}	
	}
	
	private function pixels_to_points($px) {
		return floatval($px) * 72.0/96.0;	
	}
	
	public function set_cell($attrs) {
		$defaults = array(
			'width'=>0,
			'height'=>0,
			'text'=>'',
			'border'=>0,
			'line_number'=>1,
			'alignment'=>'',
			'fill'=>false,
			'link'=>''
		);
		
		
		$var = array_replace($defaults, $attrs);
		
		extract($var);

		if ($image) {
			$this->pdf->Image($image['file'], $x, $y, $width, $height, $image['mime']);	
		} else {
			$this->pdf->SetXY($x, $y);

			$border_string = '';
			if ($border && is_array($border)) {
				foreach($border as $b) {
					if (is_null($b)) {
						continue;
					} elseif (is_array($b)) {
						$this->pdf->SetLineWidth($b['width']);
						$this->pdf->SetDrawColor($b['color']['red'], $b['color']['green'], $b['color']['blue']);
						$this->pdf->Line($b['x1'], $b['y1'], $b['x2'], $b['y2']);									
					} elseif (is_string($b)) {
						$border_string += $this->convert_side_to_string($b);					
					} else {
						continue;
					}
				}
			}

			$border_string = ($border_string) ? $border_string : '';
			if ($text) {
				//$this->pdf->SetXY($x, $y);
				if ($color) $this->pdf->SetTextColor($color["red"], $color["green"], $color["blue"]);
				if ($font) $this->pdf->SetFont($font['family'], $font['style'], $font['size']);
				//if ($text) $this->pdf->Write($height, $text);
			}
			
			if ($fill) $this->pdf->SetFillColor($fill["red"], $fill["green"], $fill["blue"]);
			$this->pdf->Cell($width, $height, (($flags & SET_INLINE_TEXT)) ? '' : $text, 0, $line_number, $alignment, ($fill) ? true : false, $link);
			
			if ($flags & SET_INLINE_TEXT) {
				if ($position_flags & FRIGHT) {
					$this->pdf->Text($x + $right_offset, $y, $text);			
				} else {
					$this->pdf->Text($x + $left_offset, $y, $text);							
				}
			}
		}
	}
	
	public function hex_to_color($hex) {
		$color_hex = str_split(substr($hex, 1, strlen($hex)), 2);					
		$color = array();
		$color["red"] = hexdec($color_hex[0]);
		$color["green"] = hexdec($color_hex[1]);
		$color["blue"] = hexdec($color_hex[2]);
		return $color;
	}

	public function finish() {
		$this->pdf->Output();
	}
	
	public function set_label_color($args) {

	}
	
	public function upload_logo($args) {
	}

	public function get_file_url() {
		return $this->fileurl;
	}
}

/* ETC

	$num_children = count($parent['children']);					
	$floaters_l = 0;
	$floaters_r = 0;
	foreach($parent['children'] as $child) {
		$view = $this->views[$child];						
		switch($view['float']) {
			case ('left'):
				++$floaters_l;
				break;
			case ('right'):
				++$floaters_r;
				break;
			case ('inherit'):
				switch($parent['position_flags']) {
					case (FLEFT):
						++$floaters_l;
						break 2;
					case (FRIGHT):
						++$floaters_r;
						break 2;											
					default:	
				}
			default:
		}
	}
*/

?>