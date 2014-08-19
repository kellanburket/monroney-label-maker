		<?php
		require_once 'restful-api.php';
		//Define Exceptions
		define('INVALID_USER_NAME', 1);
		define('NAME_ALREADY_REGISTERED', 2);
		define('EMAIL_ALREADY_REGISTERED', 3);
		define('INVALID_CHARACTERS_IN_NAME', 4);
		
		class labelgen_api extends restful_api {
			public function __construct($request, $origin) {
				parent::__construct($request);

	
				if ($this->user_is_logged_in()) {			
					$this->get_user_id_from_secret($this->request['secret'], $this->verb);
				} else {
					if ($this->endpoint == 'users') {
						//echo json_encode(array('verb'=>$this->verb, 'request'=>$this->request));
						//exit;
						if(isset($this->verb) && array_key_exists('loginPassword', $this->request)) {
							$this->method = "GET";
							$this->get_user_id_from_password($this->request['loginPassword']);						
						} else if (array_key_exists("signupPassword", $this->request) && array_key_exists("signupName", $this->request) && array_key_exists('signupEmail', $this->request)) {
							$this->user_id = NULL;
						} else if (isset($this->args) {
							$this->get_user_id_from_secret();
						} else {
							throw new Exception('Sorry. We cannot process your request at this time.');				
						}
					} else {
						throw new Exception("You are not authorized to perform this action!");					
					}
				}

	
				if ($_FILES) {
					switch($this->request['file_dir']) {
						case('customImages'): 
							$this->file_dir = 'labels'; 
							break;
						case('dealershipLogos'): 
							$this->file_dir = 'logos'; 
							break;						
						default: throw new Exception('Are you sure you want to do that?');
					}
	
					$this->pathname = WP_CONTENT_DIR.'/uploads/label-maker/user_data/'.$this->file_dir.'/';
					$this->baseurl = content_url('uploads/label-maker/user_data/'.$this->file_dir.'/');
					$this->allowed_exts = array("image"=>array("gif", "jpeg", "jpg", "pjpeg", "x-png", "bmp", "tiff", "png"));
				
					if (!is_dir(WP_CONTENT_DIR.'/uploads/label-maker')) {
						mkdir(WP_CONTENT_DIR.'/uploads/label-maker');
					}
					
					if (!is_dir(WP_CONTENT_DIR.'/uploads/label-maker/user_data')) {
						mkdir(WP_CONTENT_DIR.'/uploads/label-maker/user_data');
					}
					
					if (!is_dir($this->pathname)) {
						mkdir($this->pathname);
					}
				}
			}
			
			private function user_is_logged_in() {
				return array_key_exists('secret', $this->request) && isset($this->verb);
			}

			private function get_user_id_from_password($pw) {
				global $wpdb;											
				$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_users WHERE name = %s', array($this->verb)));
				$result = $wpdb->last_result;
				if ($result && is_array($result)) {
					if ($this->decrypt($pw, $result[0]->password)) {
						$this->user_id = intval($result[0]->id);
					} else {
						throw new Exception("Either the name or password you entered is invalid");
					}
				} else {
					throw new Exception("Invalid Password.");					
				}
			}
			
			private function get_user_id_from_secret() {
				$auth_args = explode(":", $_SERVER['HTTP_AUTHENTICATION']);
				$user = $auth_args[0];
				$nonce = $auth_args[1];
				$digest = base64_decode($auth_args[2]);
				
				$path = $_SERVER['HTTP_HOST'].$_SERVER['REDIRECT_URL'];
				//$encoded_date = urlencode($_SERVER['HTTP_DATE']);
				
				$msg = "{$this->method}+{$path}+{$encoded_date}+{$nonce}";
				
				$hash = hash_hmac('sha1', $msg, $secret);
				$secret = base64_encode($hash);				

				global $wpdb;
				$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_users WHERE secret = %s', array($secret)));
				$results = $wpdb->last_result;
				
				echo json_encode(array('results'=>$results, 'secret'=>$secret));
				exit;						
			}
			
			private function user_relationships($item_table, $item_id) {
				global $wpdb;
				$table = 'labelgen_user_relationships';
				$wpdb->insert($table, array( 
					'user_id'=>$this->user_id, 
					'table_name'=> $item_table, 
					'item_id'=>$item_id, 
					'time'=>current_time('mysql')
					)
				);
			}
			
			private function parse_args() {
				echo json_encode(array('args'=>$this->args, 'endpoint'=>$this->endpoint, 'verb'=>$this->verb));
				exit;		
			}
			
			
			protected function users() {
				if ($this->args) $this->parse_args();  
				$table= 'labelgen_users';
				$fields = array('email', 'password', 'name', 'id', 'secret');
				switch ($this->method) {
					case ('GET'):
						$conditions = array();
						if (ctype_alnum($this->verb)
							&& array_key_exists('loginPassword', $this->request) 
							&& $this->request['loginPassword']) 
						{
							$conditions['name'] = $this->verb;
						} else if (@ $this->user_id == 0) {
							$conditions['id'] = 0;
						} else {
							throw new Exception('You do not have the authorization to perform this action!');	
						}
						
						$results = $this->parse_get_request($table, $fields, $conditions);
						
						if (isset($this->request['loginPassword'])) 
							if (!$this->decrypt($this->request['loginPassword'], $results[0]['password']))
								throw new Exception('Incorrect Password!');

						$id = $results[0]['id'];
						$secret = $results[0]['secret'];
						$user = array('success'=>true, 'name'=>$results[0]['name'], 'id'=>$id, 'secret'=>$secret);
						global $wpdb;
						$tables = array("labelgen_images", "labelgen_logos", "labelgen_makes", "labelgen_models", "labelgen_years", "labelgen_options", "labelgen_discounts", "labelgen_labels");
						foreach($tables as $tbl) {							
							$num_results = $wpdb->query(
								$wpdb->prepare(
									"SELECT * FROM {$tbl} tx 
										INNER JOIN labelgen_user_relationships ty
										ON tx.id = ty.item_id 
										WHERE ty.user_id = %d OR ty.user_id = 0 AND ty.table_name = %s", 
									intval($id), $tbl
								)
							);
							if ($num_results) {
								$user[$tbl] = $wpdb->last_result;
								
								if (is_array($user[$tbl])) {
									foreach($user[$tbl] as &$ut) {
										
										$ut->id = $ut->item_id;
										unset($ut->table_name);
										unset($ut->item_id);
										unset($ut->time);
									}
								}
								
							}							 
						}
																
						if (isset($user['labelgen_options']) && is_array($user['labelgen_options'])) {
							foreach($user['labelgen_options'] as $option) {
								$user["{$option->location}_options"][] = $option;
							}		 
														
						}
						return $user;

					case ('POST'): return $this->signup_user($table, $fields);
					default: throw new Exception('Method '. $this->method . ' not supported!');				
				}
			}
			
			private function signup_user($table, $fields) {
				//First Check that all the appropriate fields have been filled in
				if ($this->request['signupEmail'] && $this->request['signupPassword'] && $this->request['signupName']) {
					
					$request['email'] = is_email($this->request['signupEmail']) ? $this->request['signupEmail'] : NULL;
					if (is_null($request['email']))
						throw new Exception('Not a valid email address!');

					
					$request['name'] = trim($this->request['signupName']);
					
										
					if ($request['name']) {
						if (!ctype_alnum($request['name'])) throw new Exception(INVALID_CHARACTERS_IN_NAME);
						
						global $wpdb;
						$wpdb->query(
							$wpdb->prepare(
								"SELECT email, name FROM labelgen_users WHERE email = %s OR name = %s", 
								array($request['email'], $request['name'])
							)
						);
						$result = $wpdb->last_result[0];
						if ($result) {
							if ($result->email == $request['email']) {
								throw new Exception(EMAIL_ALREADY_REGISTERED);
							} else if ($result->name == $request['name']) {
								throw new Exception(NAME_ALREADY_REGISTERED);
							}
						}
					} else {
						throw new Exception(INVALID_USER_NAME);
					}
					
					$request['password'] = $this->encrypt(trim($this->request['signupPassword']));
					$request['secret'] = sha1(microtime(true).mt_rand(22222,99999));
					
				} else {
					throw new Exception('Missing Vital Sign Up Information.');
				}
										
				$return = $this->parse_post_request($table, $request, true);
				
				if ($return) {
					$this->parse_post_request(
						'labelgen_apikeys', 
						array(
							'apikey'=>$this->encrypt($return['secret']),
							'secret'=>$return['secret']
						)
					);
					
					return array('success'=>true, 'id'=>$return['id'], 'secret'=>$return['secret'], 'email'=>$return['email'], 'name'=>$return['name']);
				} else {
					throw new Exception('Something went wrong. We were not able to sign you up at this time.');				
				}

			}
			
			private function parse_label_request() {
				if (array_key_exists('user_id', $this->request) && $this->request['user_id']) {
					$request = array();
					$request['user_id'] = $this->user_id;
					$request['id'] = $this->request['id'] ? intval($this->request['id']) : NULL;

					@ $request['label_color'] = ($this->request['label_color']) ? (preg_match('/^#[a-zA-Z0-9]{6,8}$/', $this->request['label_color']) ? $this->request['label_color'] : '#234a8b') : '#234a8b';
					@ $request['font_style'] = ($this->request['font_style']) ? (in_array(array('Italic', 'Normal'), $this->request['font_style']) ? $this->request['font_style'] : 'Normal') : 'Normal';
					@ $request['font_weight'] = ($this->request['font_weight']) ? (in_array(array('Bold', 'Normal'), $this->request['font_weight']) ? $this->request['font_weight'] : 'Normal') : 'Normal';
					@ $request['font_family'] = ($this->request['font_family']) ? (in_array(array('Sans Serif', 'Monospace', 'Serif'), $this->request['font_family']) ? $this->request['font_family'] : 'Sans Serif') : 'Sans Serif';
					@ $request['dealership_name'] = $this->request['dealership_name'] ? sanitize_text_field($this->request['dealership_name']) : NULL;				
					@ $request['dealership_logo_id'] = $this->request['dealership_logo_id'] ? intval($this->request['dealership_logo_id']) : NULL;				
					@ $request['dealership_tagline'] = $this->request['dealership_tagline'] ? sanitize_text_field($this->request['dealership_tagline']) : NULL;				
					//$request['dealership_info'] = $this->request['dealership_info'] ? sanitize_text_field($this->request['dealership_info']) : '';				
					@ $request['custom_image_id'] = $this->request['custom_image_id'] ? intval($this->request['custom_image_id']) : NULL;
					@ $request['name'] = $this->request['name'] ? sanitize_text_field($this->request['name']) : NULL;
					@ $request['display_logo'] = $this->request['display_logo'] ? true : false;
					//$request['make_id'] = $this->request['make_id'] ? intval($this->request['make_id']) : '';
					//$request['model_id'] = $this->request['model_id'] ? intval($this->request['model_id']) : '';
					//$request['year_id'] = $this->request['year_id'] ? intval($this->request['year_id']) : '';
					//$request['vin'] = $this->request['vin'] ? intval($this->request['vin']) : '';
					//$request['msrp'] = $this->request['msrp'] ? floatval($this->request['msrp']) : '';
					//$request['trim'] = $this->request['trim'] ? sanitize_text_field($this->request['trim']) : '';
					return $request;
				} else {
					throw new Exception('Please log in or sign up to save your form.');
				}
			}

			private function set_label_options(&$pkg) {
				$option_ids = array();
				$prices = array();
				if (array_key_exists('id', $pkg) && intval($pkg['id']) > 0) {
					global $wpdb;
					$wpdb->query($wpdb->prepare('SELECT * FROM labelgen_option_relationships WHERE label_id = %d',$pkg['id']));					
					$temp = $wpdb->last_result;
					$saved_options = array();
					$saved_prices = array();
					
					for ($i = 0; $i < count($temp); $i++) {
						$saved_options[$temp[$i]->option_id] = $temp[$i]->id;				
						$saved_prices[$temp[$i]->option_id] = $temp[$i]->price;
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
										throw new Exception('Something went terribly wrong');	
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
					throw new Exception('No Label ID Available to Add Options to!');
				}
			}
			
			protected function labels() {
				$table = 'labelgen_labels'; 
				$fields = array('id', 'label_color', 'font_style', 'font_weight', 'font_family', 'dealership_name', 'dealership_logo_id', 'dealership_tagline', 'custom_image_id', 'user_id', 'name', 'display_logo');
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
						
						//echo json_encode($request);
						//exit;
						
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

						//echo json_encode($this->request);
						//exit;
					
						$this->check_user_credentials();
						$request = $this->parse_label_request();
						
						
						$pkg = $this->parse_put_request($table, $request, array('id'=>$request['id']) );
						
						
						
						$this->set_label_options($pkg);
						return $this->win($pkg);
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						if ($id) {
							return $this->parse_delete_request($table, $id, $this->user_id);
						} else {
							throw new Exception('Unable to process request!');							
						}
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
									throw new Exception('Not a valid discount type!'); 
							}
							$result = $this->parse_post_request($table, $request);			
							$this->user_relationships($table, $result['id']);
							return $result;
						} else {
							throw new Exception('Fields Not Set');
						}
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						if ($id) {
							return $this->parse_delete_request($table, $id, $this->user_id);
						} else {
							throw new Exception('Unable to process request!');							
						}
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
							$request['price'] = floatval($this->request['price']);	
							switch ($_GET['location']) {
								case ("interior"): 
									$request['location'] = 'interior'; 
									break;
								case ("exterior"): 
									$request['location'] = 'exterior'; 
									break;
								default: 
									throw new Exception('Not a valid location!'); 
							}
							
							$result = $this->parse_post_request($table, $request);			
							$this->user_relationships($table, $result['id']);
							return $result;
						} else {
							throw new Exception('Fields Not Set');
						}
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						if ($id) {
							return $this->parse_delete_request($table, $id, $this->user_id);
						} else {
							throw new Exception('Unable to process request!');							
						}
				}
			}
		
			protected function logos() {
				$table = 'labelgen_logos';
				$conditions = array();
				switch ($this->method) {
					case ('GET'):
						if (array_key_exists('id', $this->request)) $condition['id'] = intval($this->request['id']);
						$fields = array('id', 'guid');
						return $this->parse_get_request($table, $fields, $conditions);
					case ('POST'):
						$this->check_user_credentials();
						$request['guid'] = $this->process_user_upload();
						$result = $this->parse_post_request($table, $request);			
						$this->user_relationships($table, $result['id']);
						return $result;
					case ('PUT'):
						break;
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						if ($id) {
							return $this->parse_delete_request($table, $id, $this->user_id);
						} else {
							throw new Exception('Unable to process request!');							
						}
					default:
						throw new Exception('Database update failed!');
				}
			}
			
			protected function images() {
				$table = 'labelgen_images';
				$conditions = array();
				switch ($this->method) {
					case ('GET'):
						if (array_key_exists('id', $this->request)) $condition['id'] = intval($this->request['id']);
						$fields = array('id', 'guid', 'caption');
						return $this->parse_get_request($table, $fields, $conditions);
					case ('POST'):
						$this->check_user_credentials();
						$request['guid'] = $this->process_user_upload();
						$result = $this->parse_post_request($table, $request);			
						$this->user_relationships($table, $result['id']);
						return $result;
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						return $this->parse_delete_request($table, $id, $this->user_id);
					default:
						throw new Exception('Database Update Failed!');
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
								throw new Exception('Already Added ' . $result[0]->id);
							} else {
								$request['make_id'] = intval($this->request['make_id']); 	
								$result = $this->parse_post_request($table, $request);			
								$this->user_relationships($table, $result['id']);
								return $result;
							}
						} else {
							throw new Exception('Fields Not Set');			
						}
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						return $this->parse_delete_request($table, $id, $this->user_id);
					default:
						throw new Exception(sprintf('%s requests are not accepted at this time.', $this->method));
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
								throw new Exception(array('message'=>'Already Added', 'id'=>$result[0]->id));
							} else {
								$result = $this->parse_post_request($table, $request);			
								$this->user_relationships($table, $result['id']);
								return $result;
							}
						} else {
							throw new Exception('Fields Not Set');			
						}
					case ('DELETE'):
						$this->check_user_credentials();
						$id = intval($this->request['id']);					
						return $this->parse_delete_request($table, $id, $this->user_id);
					default:
						throw new Exception(sprintf('%s requests are not accepted at this time.', $this->method));
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
							throw new Exception('Already Added ' . $result[0]->id);
						} else {
							$result = $this->parse_post_request($table, $request);			
							$this->user_relationships($table, $result['id']);
							return $result;
						}
					} else {
						throw new Exception('Fields Not Set');			
					}
				} elseif($this->method == 'DELETE') {
					$this->check_user_credentials();
					$id = intval($this->request['id']);					
					return $this->parse_delete_request($table, $id, $this->user_id);
				} else {
					throw new Exception(sprintf('%s requests are not accepted at this time.', $this->method));
				}		
			 }
			 
		}