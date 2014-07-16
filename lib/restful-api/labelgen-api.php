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
	
	protected function parse_request($table, $get_fields, $post_fields, $conditions) {
		switch ($this->method) {
			case ('GET'):
				return $this->parse_get_request($table, $get_fields, $conditions);
			case ('POST'):
				$request = array();
				return $this->parse_post_request($table, $request);			
			case ('DELETE'):
				return $this->parse_delete_request();
		}	
	}
	
	protected function labels() {
		$table = 'labelgen_labels'; 
		$fields = array('id', 'label_color', 'font_style', 'font_weight', 'font_family', 'dealership_name', 'dealership_logo', 'dealership_info', 'dealership_tagline', 'custom_label_id', 'make_id', 'model_id', 'year_id', 'trim', 'vin', 'msrp');
		switch ($this->method) {
			case ('GET'):
			
				if ($this->request['id']) {
					$conditions = array('id'=>intval($this->request['id']));
				} else {
					$conditions = array();
				}
			
				$results = $this->parse_get_request($table, $fields, $conditions);
				if ($results) {
					foreach ($results as &$result) {
						if (array_key_exists('id', $result)) {
							global $wpdb;
							$wpdb->query($wpdb->prepare('SELECT id FROM labelgen_discount_relationships where label_id = %s', $result['id']));
							$discounts = $wpdb->last_result;
							if ($discounts) {
								$result['discount_ids'] = array();
								foreach ($discounts as $discount) {
									$result['discount_ids'][] = $discount->id;
								}
							}	
		
							$wpdb->query($wpdb->prepare('SELECT id FROM labelgen_option_relationships where label_id = %s', $result['id']));
							$options = $wpdb->last_result;
							if ($options) {
								$result['option_ids'] = array();
								foreach ($options as $option) {
									$result['option_ids'][$option->id] = $option->price;
								}
							}	
						
						}
					}
				}
				return $results;				
			case ('POST'):
		
				$request['label_color'] = ($this->request['label_color']) ? (preg_match('/^#[a-zA-Z0-9]{6,8}$/', $this->request['label_color']) ? $this->request['label_color'] : '#234a8b') : '#234a8b';
				$request['font_style'] = ($this->request['font_style']) ? (in_array(array('Italic', 'Normal'), $this->request['font_style']) ? $this->request['font_style'] : 'Normal') : 'Normal';
				$request['font_weight'] = ($this->request['font_weight']) ? (in_array(array('Bold', 'Normal'), $this->request['font_weight']) ? $this->request['font_weight'] : 'Normal') : 'Normal';
				$request['font_family'] = ($this->request['font_family']) ? (in_array(array('Sans Serif', 'Monospace', 'Serif'), $this->request['font_family']) ? $this->request['font_family'] : 'Sans Serif') : 'Sans Serif';
				$request['dealership_name'] = $this->request['dealership_name'] ? sanitize_text_field($this->request['dealership_name']) : '';				
				$request['dealership_logo'] = $this->request['dealership_logo'] ? esc_url_raw($this->request['dealership_logo']) : '';				
				$request['dealership_tagline'] = $this->request['dealership_tagline'] ? sanitize_text_field($this->request['dealership_tagline']) : '';				
				$request['dealership_info'] = $this->request['dealership_info'] ? sanitize_text_field($this->request['dealership_info']) : '';				
				$request['custom_label_id'] = $this->request['custom_label_id'] ? intval($this->request['custom_label_id']) : '';
				$request['make_id'] = $this->request['make_id'] ? intval($this->request['make_id']) : '';
				$request['model_id'] = $this->request['model_id'] ? intval($this->request['model_id']) : '';
				$request['year_id'] = $this->request['year_id'] ? intval($this->request['year_id']) : '';
				$request['vin'] = $this->request['vin'] ? intval($this->request['vin']) : '';
				$request['msrp'] = $this->request['msrp'] ? floatval($this->request['msrp']) : '';
				$request['trim'] = $this->request['trim'] ? sanitize_text_field($this->request['trim']) : '';
				
				$option_ids = array();
				$discount_ids = array();
				
				$pkg = $this->parse_post_request($table, $request);
				
				if (is_array($this->request['option_ids'])) {
					$pkg['option_ids'] = array();
					foreach ($this->request['option_ids'] as $option) {
						$result = $this->parse_post_request('labelgen_option_relationships', array('option_id'=>intval($option), 'label_id'=>$pkg['id']));
						if (array_key_exists('id', $result)) {
							$pkg['option_ids'][] = $result['id'];
						}

					}
				}

				if (is_array($this->request['discount_ids'])) {
					$pkg['discount_ids'] = array();
					foreach ($this->request['discount_ids'] as $discount) {
						$result = $this->parse_post_request('labelgen_discount_relationships', array('discount_id'=>intval($discount), 'label_id'=>$pkg['id']));
						if (array_key_exists('id', $result)) {
							$pkg['discount_ids'][] = $result['id'];
						}
					}
				}
				
				return $pkg;
			case ('DELETE'):
				return $this->parse_delete_request();
		}	
	}
	
	protected function discounts() {
		$table = 'labelgen_discounts'; 
		switch ($this->method) {
			case ('GET'):
				$fields = array('id', 'type', 'amount', 'discount');
				return $this->parse_get_request($table, $fields);
			case ('POST'):
				if (isset($this->request['type']) && isset($this->request['amount']) && isset($this->request['discount'])) {
					$request['discount'] = sanitize_text_field($this->request['discount']);
					$request['amount'] = floatval($this->request['amount']);
						
					switch ($this->request['type']) {
						case ("Percentage"): 
							$request['type'] = 'Percentage'; 
							break;
						case ("Value"): 
							$request['type'] = 'Value'; 
							break;
						default: 
							$this->fail('Not a valid discount type!'); 
					}
					
					return $this->parse_post_request($table, $request);			
				} else {
					return $this->fail('Fields Not Set');
				}
			case ('DELETE'):
				return $this->parse_delete_request();
		}
	}
	
	protected function options() {
		$table = 'labelgen_options'; 
		switch ($this->method) {
			case ('GET'):
				$conditions = array('location'=>$this->request['location']);
				$fields = array('id', 'option_name', 'price', 'location');
				return $this->parse_get_request($table, $fields, $conditions);
			case ('POST'):
				if (isset($this->request['option_name']) && isset($this->request['location'])) {
					$request['option_name'] = sanitize_text_field($this->request['option_name']);
						
					switch ($_GET['location']) {
						case ("interior"): 
							$request['location'] = 'interior'; 
							break;
						case ("exterior"): 
							$request['location'] = 'exterior'; 
							break;
						default: 
							$this->fail('Not a valid location!'); 
					}
					
					return $this->parse_post_request($table, $request);			
				} else {
					return $this->fail('Fields Not Set');
				}
			case ('DELETE'):
				return $this->parse_delete_request();
		}
	}

	protected function label_images() {
		$table = 'labelgen_images';
		switch ($this->method) {
			case ('GET'):
				$conditions = array();
				$fields = array('id', 'guid', 'caption');
				return $this->parse_get_request($table, $fields, $conditions);
			case ('POST'):
				if (isset($this->request['guid'])) {
					$request['guid'] = filter_var($this->request['guid'], FILTER_VALIDATE_URL);
					$request['caption'] = (isset($this->request['caption'])) ? sanitize_text_field($this->request['caption']) : '';
					return $this->parse_post_request($table, $request);			
				} else {
					return $this->fail('Fields Not Set');
				}
			case ('DELETE'):
				return $this->parse_delete_request();
			default:
				$this->fail('Database Update Failed!');
		}
     }

	protected function models() {
		$table = 'labelgen_models'; 		
		switch ($this->method) {
			case ('GET'):
				$fields = array('id', 'model', 'make_id');
				//conditions = array('make_id'=>$this->request['make_id']);
				return $this->parse_get_request($table, $fields);
			case ('POST'):
				if (isset($this->request['make_id']) && isset($this->request['model'])) {
					//$request['id'] = intval($this->request['id']);
					$request['model'] = sanitize_text_field($this->request['model']);
					global $wpdb;
					$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_models WHERE model = %s', $request['model']));
					$result = $wpdb->last_result;
	
					if($result) {				
						return $this->fail(array('message'=>'Already Added', 'id'=>$result[0]->id));
					} else {
						$request['make_id'] = intval($this->request['make_id']); 	
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
		switch ($this->method) {
			case ('GET'):
				$fields = array('id', 'make');
				return $this->parse_get_request($table, $fields);
			case ('POST'):
				if (isset($this->request['make'])) {
					$request['make'] = sanitize_text_field($this->request['make']);
					global $wpdb;
					$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_makes WHERE make = %s', $request['make']));
					$result = $wpdb->last_result;
					if($result) {				
						$this->fail(array('message'=>'Already Added', 'id'=>$result[0]->id));
					} else {
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

	 protected function years() {
		$table = 'labelgen_years'; 		
		$request = array();
		if ($this->method == 'GET') {
			$fields = array('id', 'make_id', 'model_id', 'year');
			//$conditions = array('make_id'=>$this->request['make_id'], 'model_id'=>$this->request['model_id']);
			return $this->parse_get_request($table, $fields);
		} elseif ($this->method == 'POST') {
			if (isset($this->request['year']) && isset($this->request['make_id']) && isset($this->request['model_id']) && strlen($this->request['year']) == 4) {
				$request['year'] = intval($this->request['year']);
				$request['make_id'] = intval($this->request['make_id']);
				$request['model_id'] = intval($this->request['model_id']);
				
				global $wpdb;
				$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_years WHERE year = %d AND make_id = %d AND model_id = %d', $request['year'], $request['make_id'], $request['model_id']));
				$result = $wpdb->last_result;
				if($result) {				
					return $this->fail(array('message'=>'Already Added', 'id'=>$result[0]->id));
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
	 
}