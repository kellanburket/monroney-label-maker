<?php
abstract class restful_api {
    /**
     * Property: method
     * The HTTP method this request was made in, either GET, POST, PUT or DELETE
     */
    protected $method = '';
    /**
     * Property: endpoint
     * The Model requested in the URI. eg: /files
     */
    protected $endpoint = '';
    /**
     * Property: verb
     * An optional additional descriptor about the endpoint, used for things that can
     * not be handled by the basic methods. eg: /files/process
     */
    protected $verb = '';
    /**
     * Property: args
     * Any additional URI components after the endpoint and verb have been removed, in our
     * case, an integer ID for the resource. eg: /<endpoint>/<verb>/<arg0>/<arg1>
     * or /<endpoint>/<arg0>
     */
    protected $args = Array();
    /**
     * Property: file
     * Stores the input of the PUT request
     */
     protected $file = Null;

    /**
     * Constructor: __construct
     * Allow for CORS, assemble and pre-process the data
	 * @params $request: original uri client has requested
     */
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
}