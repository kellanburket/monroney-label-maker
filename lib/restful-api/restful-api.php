<?php
abstract class restful_api {

    protected $method = '';
    protected $endpoint = '';
    protected $verb = '';
    protected $args = array();
    protected $file = NULL;
	
	protected $file_dir;
	
	protected $user_table;
	
	protected $pathname; 
	protected $baseurl;
	protected $allowed_exts;
	protected $input_name = 'file';
	protected $user_id;

    public function __construct($request) {
        header("Access-Control-Allow-Orgin: *"); //allow requests from any origin to be processed
        header("Access-Control-Allow-Methods: *"); //allow any http method to be accepted
        if (!$_FILES) header("Content-Type: application/json");
		$this->debug_values = array('debug_values'=>'none');
        $this->args = explode('/', rtrim($request, '/'));
		$this->endpoint = array_shift($this->args);
		
		$this->pathname = (isset($pathname)) ? $pathname : WP_CONTENT_DIR.'/uploads/';
		$this->baseurl = (isset($baseurl)) ? $baseurl : content_url('uploads/');
		$this->allowed_exts = (isset($allowed_exts)) ? $allowed_exts : '';
		
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
		if ($this->method == 'POST' && $_FILES) {
			$this->file = $_FILES;			
			$this->request = $_POST;
		} else if ($this->method == 'POST') {
			$this->file = file_get_contents("php://input", "r");
			$this->request = array();
			parse_str($this->file, $this->request);
			//$this->request = $_POST;

			//echo json_encode($this->request);
			//exit;
			
		} elseif ($this->method == 'GET') {
			$this->request = $_GET;
		} elseif ($this->method == 'PUT') {
			$this->file = file_get_contents("php://input", "r");
			$this->request = array();
			parse_str($this->file, $this->request);
			//echo json_encode($this->request);
			//exit;
		} elseif($this->method == 'DELETE') { 
            $this->method = 'DELETE';
			$this->request = $_GET;		
		} else {
			$this->_response('Invalid Method', 405);
		}

		//echo json_encode($this->request);
		//exit;		
		if ((array_key_exists('user_id', $this->request) && is_numeric($this->request['user_id']))) {			
			$this->user_id = intval($this->request['user_id']);
		} else {
			if ($this->endpoint == 'users') {
				if(array_key_exists('id', $this->request) && is_numeric($this->request['id'])) {
					$this->user_id = intval($this->request['id']);				
				} else if ($this->method = "GET") {
					$this->user_id = 0;								
				} else {
					$this->fail('Cannot process requests without a proper user id.');				
				}
			} else {
				$this->fail('Cannot process requests without an id.');
			}
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

	protected function decrypt($input, $hash) {		
		$hash = trim($hash);
		$input = trim($input);
		
		$result = crypt($input, $hash);
		$compare = strcmp($result, $hash);

		if ($compare === 0) {
			return true;
		} else {
			return false;
		}
	}
		
	protected function encrypt($passw, $cost = 10) {
		// Create a random salt
		$salt = strtr(base64_encode(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM)), '+', '.');		
		// Prefix information about the hash so PHP knows how to verify it later.
		// "$2a$" Means we're using the Blowfish algorithm. The following two digits are the cost parameter.
		$salt = sprintf("$2a$%02d$", $cost) . $salt;
		
		// Hash the password with the salt
		$hash = crypt($passw, $salt);

		//echo json_encode(array('password'=>$passw, 'hash'=>$hash, 'salt'=>$salt));
		//exit;

		return $hash;
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

	protected function build_conditional_string($conditions, $format) {

		$conditions_string = ' WHERE';
		foreach($conditions as $key=>$value) {

			if (is_string($value)||is_numeric($value)) {
				$conditions_string .= ' '.$key.' = '.$format[$key];
				if ($value !== end($conditions)) {
					$conditions_string .= ' AND';
				}
			} else {
				$this->fail('Embedded Fields Not Allowed.');
			}
		}
		return $conditions_string;
	}

	protected function validate_table($table) {
		if (!is_string($table)) {
			$this->fail('Not table id given.');
		}
	}

	protected function validate_request_data($request) {
		if (!is_array($request) || !$request) {
			$this->fail('No request data sent to server!');	
		}
	}
	 
	protected function validate_conditions($conditions) {
		if (!is_array($conditions)) {
			$this->fail('No conditions given.');
		}
	}
	
	protected function check_user_credentials() {
		$cred = true;
		
		//$this->request['method'] = $this->method;
		//echo json_encode($this->request);
		//exit;
		
		if (!array_key_exists('user_id', $this->request)) {
			$cred = false;								
		} else if (!$this->request['user_id']) {
			$cred = false;
		}

		if (!$cred) {
			$this->fail('You do not have the credentials to perform this action.');
		}
	}
	
	protected function validate_fields($fields) {
		if (!is_array($fields)) {
			$this->fail('No Fields Requested From Database.');
		}
	}

	protected function parse_get_request($table, $fields, $conditions = array()) {
		$this->validate_fields($fields);
		$this->validate_table($table);
		$this->validate_conditions($conditions);
		
		$field_string = '';
		foreach($fields as $field) {
			if (is_string($field) || is_numeric($field)) {
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

			$conditions_string = $this->build_conditional_string($conditions, $format);
			

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
			echo json_encode(array('success'=>true, 'results'=>0));
			exit;
		}
		
		return $data;
	}
	 	
	protected function parse_put_request($table, $requests, $conditions) {
	 	$this->validate_table($table);
		$this->validate_request_data($requests);
		$this->validate_conditions($conditions);

		global $wpdb;
		$this->filter_requests($requests);		
		$format = $this->get_format($requests);

		$conditional_string = $this->build_conditional_string($conditions, $format);
		
		$set_string = ' SET';
		$id = $requests['id'];
		unset($requests['id']);
		
		foreach($requests as $key=>$value) {
			$set_string .= ' '.$key.'='.$format[$key];						
			if ($value != end($requests)) {
				$set_string .= ',';
			}
		}
		$query = 'UPDATE '.$table.$set_string.$conditional_string;
		$request_values = array_values($requests);

		$request_values[] = $id;

		$wpdb->query($wpdb->prepare($query, $request_values));

		$requests['id'] = $id;
		return $requests;
	}
	
	public function array_select($array, $keys) {
		$new_array = array();
		foreach($array as $key=>$value) {
			if (in_array($key, $keys)) {
				$new_array[$key] = $value;
			}		
		}
		return $new_array;
	}
	
	protected function filter_requests(&$requests) {
		$requests = array_filter($requests, function($req) {
			if (!is_null($req)) {
				return true;
			} else {
				return false;
			}
		});	
	}
	
	protected function db_values() {
		global $wpdb;
		echo json_encode( array(
			'last_result'=>$wpdb->last_result, 
			'last_error'=>$wpdb->last_error, 
			'insert_id'=>$wpdb->insert_id, 
			'num_rows'=>$wpdb->num_rows, 
			'col_info'=>$wpdb->col_info,
			'num_queries'=>$wpdb->num_queries,
			'last_query'=>$wpdb->last_query
		)); 
		exit;
	}
	
	protected function parse_post_request($table, $requests, $check_duplicates = true) {
		$this->validate_table($table);
		$this->validate_request_data($requests);

		global $wpdb;
		$this->filter_requests($requests);		
		$format = $this->get_format($requests);


		if ($check_duplicates) {			
			$conditional = $this->build_conditional_string($requests, $format);

			$wpdb->query($wpdb->prepare('SELECT * FROM '.$table.$conditional, array_values($requests), array_values($format)));
			
			if($result = $wpdb->last_result) {
				if (is_array($result)) {
					$data = array();
					$fields = array_keys($requests);
					$fields[] = 'id';
					
					foreach($fields as $field) {
						$data[$field] = $result[0]->$field;
					}
					$data['success'] = true;		
					$wpdb->insert($this->user_table, array('user_id'=>$this->user_id, 'table_name'=>$table, 'item_id'=>$data['id'], 'time'=>current_time('mysql')));
					return $data;
				}
			}
		}


		$requests['time'] = current_time('mysql');
		$format['time'] = '%s'; 

		$wpdb->insert($table, $requests, array_values($format));
		
		$requests['id'] = $wpdb->insert_id;
		if ($requests['id']) {
			$requests['succcess'] = true;
			$wpdb->insert($this->user_table, array('user_id'=>$this->user_id, 'table_name'=>$table, 'item_id'=>$requests['id'], 'time'=>$requests['time']));
			return $requests;
		} else {
			$this->fail(array_merge(array('message'=>'Nothing inserted'), $this->get_wpdb_values()));
		}	

	 }
	 
	 function parse_delete_request() {	
		$this->check_user_credentials();
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
	
	function approve_mime_type($file_type, $file_name) {
		$approved_type = false;
		//echo "\nFile Type: $file_type";
		if (is_array($this->allowed_exts)) {
			foreach($this->allowed_exts as $type=>$media) {
				foreach($media as $medium) {
					$mime_type = $type.'/'.$medium;
					//echo "\nMime Type: $mime_type";

					if ($file_type == $mime_type) {
						//wp_check_filetype_and_ext($file_name, array($medium, $mime_type));					
						$approved_type = $mime_type;
						break 2;
					}			
				}
			}
		}
		return $approved_type; 
	}

	
	function load_error_messages($message) {
		switch($msg) {
			case (UPLOAD_ERR_OK): return 'OK';
			case (UPLOAD_ERR_INI_SIZE): return 'File exceeds max file size as specified by the server.'; 
			case (UPLOAD_ERR_FORM_SIZE): return 'File exceeds max file size as specified by the form.';
			case (UPLOAD_ERR_PARTIAL): return 'File only partially uploaded.';
			case (UPLOAD_ERR_NO_FILE): return 'No file was found to upload.';
			case (UPLOAD_ERR_NO_TMP_DIR): return 'No temp directory to store file.';
			case (UPLOAD_ERR_CANT_WRITE): return 'Failed to write file to disk.';
			case (UPLOAD_ERR_EXTENSION): return 'A PHP extension has prevented the upload from completing.';
		}
	}
	
	function process_user_upload() {
		//wp_verify_nonce('_file_upload_handler', 'process_user_upload');
		//echo json_encode($this->file);
		//echo $this->input_name;
		//exit;
		$error_code = $this->file[$this->input_name]["error"];
		if ($error_code != UPLOAD_ERR_OK) {
			$this->fail($this->load_error_message($error_code));			
		}

		$temp_filename = $this->file[$this->input_name]['tmp_name'];

		if ($temp_filename) {
			$finfo = new finfo(FILEINFO_MIME_TYPE);
			$this->file_type = $this->approve_mime_type($finfo->file($temp_filename), $temp_filename);
			if (!$this->file_type) {
				$this->fail('Not an Approved Mime Type');
			}
		} else {
			$this->fail(false, 'Not an Approved Mime Type');
		}

		$file_name = strtolower(preg_replace('/[^a-zA-Z0-9\.]/', '_', $this->file[$this->input_name]["name"]));
		
		if (validate_file($file_name) === 0) {
			$this->file_name = $file_name;
			$this->file_path = $this->pathname.$this->file_name;
		} else {
			$this->fail('Invalid filename.');		
		}

		$this->file_size = intval($_FILES[$this->input_name]['size']);
		
		$file_has_been_moved = move_uploaded_file($temp_filename, $this->file_path);
		
		if ($file_has_been_moved) {
			$this->file_url = $this->baseurl.$this->file_name;
			return esc_url_raw($this->file_url);	
		} else {
			$this->fail('There was a problem moving your file into a new directory');
		}

	}
}