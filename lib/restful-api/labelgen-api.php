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
			
			protected function users() {
				$table= 'labelgen_users';
				$fields = array('email', 'password', 'name', 'id');
				switch ($this->method) {
					case ('GET'):
						$conditions = array();
						if ($this->request['loginEmail'] && $this->request['loginPassword']) {
							//$conditions['password'] = trim($this->request['loginPassword']);
							$conditions['email'] = is_email($this->request['loginEmail']) ? $this->request['loginEmail'] : $this->fail('Not a valid email address!');
						}
						
						$results = $this->parse_get_request($table, $fields, $conditions);
						//echo json_encode($results);
						//exit;
						if ( $this->decrypt($this->request['loginPassword'], $results[0]['password']) ) {
							return array('success'=>true, 'name'=>$results[0]['name'], 'id'=>$results[0]['id']);
						} else {
							$this->fail('Incorrect Password!');
						}
		
					case ('POST'):
						if ($this->request['signupEmail'] && $this->request['signupPassword'] && $this->request['signupName']) {
							$request['password'] = $this->encrypt(trim($this->request['signupPassword']));
							$request['email'] = is_email($this->request['signupEmail']) ? $this->request['signupEmail'] : $this->fail('Not a valid email address!');
							$request['name'] = sanitize_text_field($this->request['signupName']);
						} else {
							$this->fail('Missing Vital Sign Up Information.');
						}
						if ($return = $this->parse_post_request($table, $request)) {
							return array('success'=>true, 'email'=>$return['email'], 'name'=>$return['name'], 'in_password'=>$request['password'], 'out_password'=>$return['password']);
						} else {
							$this->fail('Something went wrong. We were not able to sign you up at this time.');				
						}
					default:
						$this->fail('Method '. $this->method . ' not supported!');				
				}
			}
			
			protected function parse_label_request() {
				if (array_key_exists('user_id', $this->request) && $this->request['user_id']) {
					$request = array();
					$request['user_id'] = intval($this->request['user_id']);
					$request['id'] = $this->request['id'] ? intval($this->request['id']) : '';

					@ $request['label_color'] = ($this->request['label_color']) ? (preg_match('/^#[a-zA-Z0-9]{6,8}$/', $this->request['label_color']) ? $this->request['label_color'] : '#234a8b') : '#234a8b';
					@ $request['font_style'] = ($this->request['font_style']) ? (in_array(array('Italic', 'Normal'), $this->request['font_style']) ? $this->request['font_style'] : 'Normal') : 'Normal';
					@ $request['font_weight'] = ($this->request['font_weight']) ? (in_array(array('Bold', 'Normal'), $this->request['font_weight']) ? $this->request['font_weight'] : 'Normal') : 'Normal';
					@ $request['font_family'] = ($this->request['font_family']) ? (in_array(array('Sans Serif', 'Monospace', 'Serif'), $this->request['font_family']) ? $this->request['font_family'] : 'Sans Serif') : 'Sans Serif';
					@ $request['dealership_name'] = $this->request['dealership_name'] ? sanitize_text_field($this->request['dealership_name']) : '';				
					@ $request['dealership_logo'] = $this->request['dealership_logo'] ? esc_url_raw($this->request['dealership_logo']) : '';				
					@ $request['dealership_tagline'] = $this->request['dealership_tagline'] ? sanitize_text_field($this->request['dealership_tagline']) : '';				
					//$request['dealership_info'] = $this->request['dealership_info'] ? sanitize_text_field($this->request['dealership_info']) : '';				
					@ $request['custom_label_id'] = $this->request['custom_label_id'] ? intval($this->request['custom_label_id']) : '';
					@ $request['name'] = $this->request['name'] ? sanitize_text_field($this->request['name']) : '';
					//$request['make_id'] = $this->request['make_id'] ? intval($this->request['make_id']) : '';
					//$request['model_id'] = $this->request['model_id'] ? intval($this->request['model_id']) : '';
					//$request['year_id'] = $this->request['year_id'] ? intval($this->request['year_id']) : '';
					//$request['vin'] = $this->request['vin'] ? intval($this->request['vin']) : '';
					//$request['msrp'] = $this->request['msrp'] ? floatval($this->request['msrp']) : '';
					//$request['trim'] = $this->request['trim'] ? sanitize_text_field($this->request['trim']) : '';
					return $request;
				} else {
					$this->fail('Please log in or sign up to save your form.');
				}
			}

			protected function set_label_options(&$pkg) {
				$option_ids = array();
				$prices = array();
				if (array_key_exists('id', $pkg) && intval($pkg['id']) > 0) {
					global $wpdb;
					$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_option_relationships WHERE label_id = %d',$pkg['id']));					
					$temp = $wpdb->last_result;
					$saved_options = array();
					$saved_prices = array();
					
					for ($i = 0; $i < count($temp); $i++) {
						$saved_options[$o['option_id']] = $temp[$i]['id'];				
						$saved_prices[$o['option_id']] = $temp[$i]['price'];
					}
					
					if (array_key_exists('option_ids', $this->request) && is_array($this->request['option_ids'])) {
						foreach($this->request['option_ids'] as $id) {
							$option_id = intval($id);
							$price = floatval($this->request['option_prices'][$option_id]);			
							if ($option_id) {
								$option_ids[] = $option_id;
								$prices[$option_id] = $price;
								if (!array_key_exists($option_id, $saved_options)) {
									
									
									$result = $this->parse_post_request(
										'labelgen_option_relationships', 
										array(
											'option_id'=>$option_id, 
											'label_id'=>$pkg['id'], 
											'price'=>$price
										)
									);
									if (!array_key_exists('id', $result)) {
										$this->fail('Something went terribly wrong');	
									}				
								} else {
								
									if (array_key_exists('option_prices', $this->request) && array_key_exists($this->request['option_prices'], $option_id)) {
										$prices[] = $this->request['option_prices'][$option_id];
										if ($this->request['option_prices'][$option_id] != $saved_prices[$option_id]) {
											$this->parse_put_request(
												'labelgen_option_relationships', 
												array(
													'price'=>$this->request['option_prices'][$option_id]	
												),
												array(
													'option_id'=>$option_id, 
													'label_id'=>$pkg['id'],
												) 
											);
										}
									}										
								}
							}				
						}						
						$pkg['option_ids'] = $option_ids;
						$pkg['price_ids'] = $prices;
					}
				} else {
					$this->fail('No Label ID Available to Add Options to!');
				}
			}
			
			protected function labels() {
				$table = 'labelgen_labels'; 
				$fields = array('id', 'label_color', 'font_style', 'font_weight', 'font_family', 'dealership_name', 'dealership_logo', 'dealership_tagline', 'custom_label_id', 'user_id', 'name');
				$conditions = array();
				
				switch ($this->method) {
					case ('GET'):
						if ($this->request['user_id']) {
							$conditions['user_id'] = intval($this->request['user_id']);
							
							if (array_key_exists('id', $this->request) && intval($this->request['id']) > 0) {
								$conditions['id'] = intval($this->request['id']);
							}						

							$results = $this->parse_get_request($table, $fields, $conditions);
							
							if ($results) {

								foreach ($results as &$result) {
									if (array_key_exists('id', $result)) {
										
										global $wpdb;
										
										$wpdb->query($wpdb->prepare('SELECT option_id, price FROM labelgen_option_relationships where label_id = %d', $result['id']));
										$options = $wpdb->last_result;
										if ($options) {
											$result['option_ids'] = array();
											$result['option_prices'] = array();
											foreach ($options as $option) {
												$result['option_ids'][] = $option->option_id;
												$result['option_prices'][$option->option_id] = $option->price;
											}
										}	
									
									}
								}
								return $results;				

							}
							return array('success'=>true, 'message'=>'No label saved.');
						} else {
							return array('success'=>true, 'message'=>'No label saved.');
						}
					case ('POST'):
						$this->check_user_credentials();
						$request = $this->parse_label_request();
						
						global $wpdb;
						$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_labels WHERE user_id = %d AND name = %s', $request['user_id'], $request['name']));
						$result = $wpdb->last_result;
						if ($result) {
							$request['id'] = $result[0]->id;
							$pkg = $this->parse_put_request($table, $request, $this->array_select($request, array('id')));			
						} else {
							$pkg = $this->parse_post_request($table, $request, false);
						}
						
						$this->set_label_options($pkg);
						$pkg['request_method'] = $this->method;
						
						return $this->win($pkg);
					case ('PUT'):
						$this->check_user_credentials();
						$request = $this->parse_label_request();
						$pkg = $this->parse_put_request($table, $request, array('id'=>$request['id']) );
						
						
						
						$this->set_label_options($pkg);
						return $this->win($pkg);
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
						$this->check_user_credentials();
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
						$this->check_user_credentials();
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
						$this->check_user_credentials();
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
						$this->check_user_credentials();
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
						$this->check_user_credentials();
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
					$this->check_user_credentials();
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