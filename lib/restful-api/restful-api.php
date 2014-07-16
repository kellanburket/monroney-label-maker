<?php
abstract class restful_api {

    protected $method = '';
    protected $endpoint = '';
    protected $verb = '';
    protected $args = array();
    protected $file = NULL;

    public function __construct($request) {
        header("Access-Control-Allow-Orgin: *"); //allow requests from any origin to be processed
        header("Access-Control-Allow-Methods: *"); //allow any http method to be accepted
        header("Content-Type: application/json");
		$this->debug_values = array('debug_values'=>'none');

		
        $this->args = explode('/', rtrim($request, '/'));
		        
		$this->endpoint = array_shift($this->args);
		
		if(array_key_exists(0, $this->args)) {
			$this->request = $this->args[0];
		}

        $this->method = $_SERVER['REQUEST_METHOD'];
        
		if ($this->method == 'POST' && array_key_exists('HTTP_X_HTTP_METHOD', $_SERVER)) {
            if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'DELETE') {
                $this->method = 'DELETE';
            } else if ($_SERVER['HTTP_X_HTTP_METHOD'] == 'PUT') {
                $this->method = 'PUT';
            } else {
                throw new Exception("Unexpected Header");
            }
        }
		
		if ($this->method == 'POST') {
			$this->request = $_POST;
		} elseif ($this->method == 'GET') {
			$this->request = $_GET;
		} elseif ($this->method == 'PUT') {
			$this->request = $_GET;
			$this->file = file_get_contents("php://input");	//will have to discover how this works
		} elseif($this->method == 'DELETE') { 
		} else {
			$this->_response('Invalid Method', 405);
		}
    }
	
	public function processAPI() {
		if ((int) method_exists($this, $this->endpoint) > 0) {
            return $this->_response($this->{$this->endpoint}($this->args));
        } else {
        	return $this->_response("No Endpoint: $this->endpoint", 404);
		}
    }

    private function _response($data, $status = 200) {
        header("HTTP/1.1 " . $status . " " . $this->_requestStatus($status));
       	$data = (!is_array($data)) ? array($data) : $data;
	    return json_encode($data);
    }

    private function _requestStatus($code) {
        switch ($code) {
			case (200): return 'OK';
			case (404): return 'Not Found';
			case (405): return 'Method Not Allowed';
			case (505): return 'HTTP Version Not Supported';
			default: return 'Internal Server Error';
		}
    }
	
	protected function win($message) {
	 	return $this->prepare_message_array($message, true);
	 }
	 
	 protected function fail($message) {
		echo $this->_response($this->prepare_message_array($message, false));
	 	exit;
	 }

	private function process_message($messages) {
		$m = array();
		if (!$messages) {
			$m['message'] = 'No POST Content';
		} elseif (is_array($messages)) {
			foreach($messages as $key => $value) {
				if ($key != 'success') {
					if (is_array($value)) {
						$m[$key] = $this->process_message($value);
					} else {
						$m[$key] = $value;
					}
				}
			}
		} elseif (is_string($messages)) {
			$m['message'] = $messages;
		} else {
			$m['log'] = print_r($messages, true);
		}
		return $m;
	}
	
	private function prepare_message_array($messages, $success) {
		$m = array('success'=>$success);
		return array_merge($m, $this->process_message($messages), array('method'=>$this->method)); 		
	}
	
	protected function get_wpdb_values() {
		global $wpdb;
		return array('last_query'=>trim($wpdb->last_query), 'last_error'=>trim($wpdb->last_error), 'last_result'=>trim(print_r($wpdb->last_result, true)));
	}
	
	public function add_special_debug_values($var) {
		$this->debug_values = $var;
	}
	
	protected function parse_get_request($table, $fields, $conditions = array()) {
		if (!is_array($fields)) {
			$this->fail('No Fields Requested From Database.');
		}
		
		if (!is_string($table)) {
			$this->fail('Not table id given.');
		}

		if (!is_array($conditions)) {
			$this->fail('No conditions given.');		
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
		if ($conditions) {
			$format = $this->get_format($conditions);
			$conditions_string = ' WHERE';
			foreach($conditions as $key=>$value) {
				if (is_string($value)) {
					$conditions_string .= ' '.$key.' = '.$format[$key];
					if ($value !== end($conditions)) {
						$conditions_string .= ' AND';
					}
				} else {
					$this->fail('Embedded Fields Not Allowed.');
				}
			}
			$format = array_values($format);
			$conditions = array_values($conditions);
			$wpdb->query($wpdb->prepare('SELECT'.$field_string.' FROM '.$table.$conditions_string, $conditions, $format));
		} else {
			$wpdb->query('SELECT'.$field_string.' FROM '.$table);
		}
		
		
		$data = array();
		$result = $wpdb->last_result;
		
		if ($result && is_array($result)) {
			for($i = 0; $i < count($result); $i++) {
				foreach($fields as $field) {
					$data[$i][$field] = $result[$i]->$field;
				}
			}
		} else {
			$this->fail('No Matching Options');
		}
		
		return $data;
	 }
	 
	 protected function parse_post_request($table, $requests) {
		
		if (!is_string($table)) {
			$this->fail('Not table id given.');
		}

		if (current_user_can('upload_files')) {
			
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
				$format['time'] = '%s'; 

				$wpdb->insert($table, $requests, array_values($format));
				$requests['id'] = $wpdb->insert_id;
				
				if ($requests['id']) {
					return $requests;
				} else {
					$this->fail(array_merge(array('message'=>'Nothing inserted'), $this->get_wpdb_values()));
				}	
			
			} else {
				$this->fail('No request data sent to server!');				
			}
		} else {
			$this->fail('You do not have sufficient privileges to perform this action.');			
		}
	 }
	 
	 function parse_delete_request() {	
		if (current_user_can('delete_posts')) {
			$id = intval($this->request);
						
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
	
}