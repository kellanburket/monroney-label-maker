<?php
require_once('restful-api.php');

class labelgen_api extends restful_api {
    
	//protected $User;

    public function __construct($request, $origin) {
        
		parent::__construct($request);

	
        // Abstracted out for example
        
		//$APIKey = new Models\APIKey();
        //$User = new Models\User();
		/*
		try {
			if (!array_key_exists('apiKey', $this->request)) {
				throw new Exception('No API Key provided');
			} else if (!$APIKey->verifyKey($this->request['apiKey'], $origin)) {
				throw new Exception('Invalid API Key');
			} else if (array_key_exists('token', $this->request) && !$User->get('token', $this->request['token'])) {
				throw new Exception('Invalid User Token');
			}
		} catch(Exception $exc) {
			echo json_encode(array('success'=>false, 'message'=>$exc->getMessage()));
			exit;
		}
		*/
        //$this->User = $User;
    }
    /**
     * Example of an Endpoint
     */
	 
	 
	 protected function parse_get_request($table, $fields) {
		if (!is_array($fields)) {
			$this->fail('No Fields Requested From Database.');
		}
		
		if (!is_string($table)) {
			$this->fail('Not table id given.');
		}

		$field_string = '';
		foreach($fields as $field) {
			if (is_string($field)) {
				$field_string .= ' '.$field;
				if ($field !== end($fields)) {
					$field_string .= ',';
				}
			} else {
				$this->fail('Embedded Fields Not Allowed.');
			}
		}
		
	
		
		global $wpdb;
		$wpdb->query('SELECT'.$field_string.' FROM '.$table.'');
		
		$data = array();
		$result = $wpdb->last_result;
		
		if (is_array($result)) {
			for($i = 0; $i < count($result); $i++) {
				foreach($fields as $field) {
					$data[$i][$field] = $result[$i]->$field;
				}
			}
		} else {
			return 'No database results.';
		}
		
		return $data;
	 }
	 
	 protected function parse_post_request($table, $requests) {
		
		if (!is_string($table)) {
			$this->fail('Not table id given.');
		}

		if (current_user_can('upload_files')) {
			
			if (!$requests) {
				$this->fail('No request data sent to server!');				
			}
						
			if ($requests) {				
				global $wpdb;
				$format = $this->get_format($requests);
				
				$conditional = ' WHERE';
				foreach($requests as $r_name=>$r_value) {
					$conditional .= ' '.$r_name.' = '.$format[$r_name];
					if ($r_value !== end($requests)) {
						$conditional .= ' AND';
					}
				}
				
				$wpdb->query($wpdb->prepare('SELECT * FROM '.$table.$conditional, array_values($requests), array_values($format)));
				
				if($wpdb->last_result) {
					$this->fail('Item has already been listed');	
				}

				$requests['time'] = current_time('mysql'); 
				$requests['insert_id'] = $wpdb->insert($table, $requests, array_values($format));
				
				if ($requests['insert_id']) {
					return $requests;
				} else {
					$this->fail($this->get_wpdb_values());
				}	
			
			} else {
				$this->fail($this->get_wpdb_values());				
			}
		} else {
			$this->fail('You do not have sufficient privileges to perform this action.');			
		}
	 }
	 
	 function parse_delete_request() {	
		if (current_user_can('delete_posts')) {
			$cid = $this->validate_cid($this->request);
						
		} else {
			$this->fail('You do not have sufficient privileges to perform this action.');			
		}
	 }

	protected function get_format($var) {
		$format = array();
		foreach($var as $key=>$value) {
			if (is_int($value) || is_bool($value) || is_long($value)) {
				$format[$key] = '%d';
			} elseif (is_float($value) || is_double($value)) {
				$format[$key] = '%f';
			} else {
				$format[$key] = '%s';
			}
		}
		return $format;
	}
	 	 
	 protected function get_dependency($table, $target, $fields) {

		if (!is_array($fields)) {
			$this->fail('No Fields Requested From Database.');
		}

		if (!is_string($table)) {
			$this->fail('No table id given.');
		}


		$select = 'SELECT '.$target.' FROM ';
					
		$format = $this->get_format($fields);
		
		$conditional = ' WHERE';
		foreach($fields as $field_name=>$field_value) {
			$conditional .= ' '.$field_name.' = '.$format[$field_name];
			if ($field_value !== end($fields)) {
				$conditional .= ' AND';
			}
		}

		global $wpdb;
		$wpdb->get_row($wpdb->prepare($select.$table.$conditional, array_values($fields), array_values($format)));
		$result = $wpdb->last_result;
		
		if (!$result) {
			$fields['time'] = current_time('mysql'); 
			$wpdb->insert($table, $fields, array_values($format)); 
			$result = $wpdb->insert_id;			
			if (!$result) {
				$this->fail($this->get_wpdb_values());
			} 
		} else {
			$result = $result[0]->$target;
		}
		
		return $result;	
	 }
	 
	 
	 protected function models() {
		$table = 'labelgen_models'; 		
		switch ($this->method) {
			case ('GET'):
				$fields = array('model', 'make_cid');
				return $this->parse_get_request($table, $fields);
			case ('POST'):
				if (isset($this->request['make']) && isset($this->request['model'])) {
					$request['cid'] = $this->validate_cid($this->request['id']);
					$request['model'] = sanitize_text_field($this->request['model']);
					
					global $wpdb;
					$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_models WHERE model = %s', $request['model']));
					$result = $wpdb->last_result;
	
					if($result) {				
						return $this->fail(array('message'=>'Already Added', 'cid'=>$result[0]->cid));
					} else {
						$request['make_cid'] = $this->get_dependency('labelgen_makes', 'cid', array('make' => sanitize_text_field($this->request['make']))); 	
						return $this->parse_post_request($table, $request);			
					}
				} else {
					$this->fail('Fields Not Set');			
				}
			case ('DELETE'):
				return $this->parse_delete_request();
			default:
				$this->fail(sprintf('%s requests are not accepted at this time.', $this->method));
        }		
	 }
	 
	 protected function makes() {
		$table = 'labelgen_makes'; 		
		$request = array();
		if ($this->method == 'GET') {
			$fields = array('make');
			return $this->parse_get_request($table, $fields);
		} elseif ($this->method == 'POST') {
			if (isset($this->request['make'])) {
				$request['cid'] = $this->validate_cid($this->request['id']);				
				$request['make'] = sanitize_text_field($this->request['make']);
				
				global $wpdb;
				$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_makes WHERE make = %s', $request['make']));
				
				$result = $wpdb->last_result;

				if($result) {				
					$this->fail(array('message'=>'Already Added', 'cid'=>$result[0]->cid));
				} else {
					return $this->parse_post_request($table, $request);			
				}
			} else {
				$this->fail('Fields Not Set');			
			}
		} elseif($this->method == 'DELETE') {
			echo json_encode(array('response'=>$this->request));
			exit;
		} else {
			$this->fail(sprintf('%s requests are not accepted at this time.', $this->method));
        }		
	 }

	 protected function years() {
		$table = 'labelgen_years'; 		
		$request = array();
		if ($this->method == 'GET') {
			$fields = array('make_cid', 'model_cid', 'year');
			return $this->parse_get_request($table, $fields);
		} elseif ($this->method == 'POST') {
			if (isset($this->request['year']) && isset($this->request['make']) && isset($this->request['model']) && strlen($this->request['year']) == 4) {
				$request['cid'] = $this->validate_cid($this->request['id']);
				$request['year'] = intval($this->request['year']);
				$request['make_cid'] = $this->get_dependency('labelgen_makes', 'cid', array('make'=>sanitize_text_field($this->request['make'])));
				$request['model_cid'] = $this->get_dependency('labelgen_models', 'cid', array('model'=>sanitize_text_field($this->request['model']), 'make_cid'=>$request['make_cid'])); 
				global $wpdb;
				$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_years WHERE year = %d AND make_cid = %s AND model_cid = %s', $request['year'], $request['make_cid'], $request['model_cid']));
				$result = $wpdb->last_result;
				if($result) {				
					return $this->fail(array('message'=>'Already Added', 'cid'=>$result[0]->cid));
				} else {
					
					
					return $this->parse_post_request($table, $request);			
				}
			} else {
				$this->fail('Fields Not Set');			
			}
		} elseif($this->method == 'DELETE') {
			echo json_encode($this->request);
			exit;
		} else {
			$this->fail(sprintf('%s requests are not accepted at this time.', $this->method));
        }		
	 }
	 
     protected function label_images() {
		if ($this->method == 'GET') {
			global $wpdb;
			$wpdb->query('SELECT guid, caption FROM labelgen_images');
			
			$images = array();
			$result = $wpdb->last_result;
			
			if (is_array($result)) {
				for($i = 0; $i < count($result); $i++) {
					$images[$i]['guid'] = $result[$i]->guid;
					$images[$i]['caption'] = $result[$i]->caption;
				}
			}
			return $images;	        
		} elseif ($this->method == 'POST') {
			if (current_user_can('upload_files')) {
				
				if (!isset($this->request['guid'])) {
					$this->fail($this->request);				
				}
				
				$guid = filter_var($this->request['guid'], FILTER_VALIDATE_URL);
				$cap = (isset($this->request['caption'])) ? sanitize_text_field($this->request['caption']) : '';
				
				if ($guid) {				
					global $wpdb;
					$insert_id = $wpdb->insert('labelgen_images', array("guid" => $guid, "time" => current_time('mysql'), "caption" => $cap), array('%s', '%s', '%s'));
					
					if ($insert_id) {
						return $this->win(array_merge(array('id'=>$insert_id, 'caption'=>$cap, 'guid'=>$guid), $this->get_wpdb_values()));
					} else {
						$this->fail('Image URL Not Valid.');
					}
					
				} else {
					$this->fail('Could not update database');				
				}
				
			} else {
				$this->fail('You do not have sufficient privileges to perform this action.');			
			}
		} else {
			$this->fail('Only GET requests may be accepted at this time.');
        }
     }
	 
	 protected function validate_cid($cid) {
		if (preg_match('/^c[0-9]{1,9}$/i', $cid, $matches)) {
			return $matches[0];			
		} else {
			$this->fail('No CID');
		}
	 }
}