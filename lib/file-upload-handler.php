<?php

class File_Upload_Handler {

	private $pathname;
	private $baseurl;
	private $max_size;
	private $allowed_ext;
	private $name;
	private $input_name;

	private $filter_hook;
	
	private $file_url;
	private $file_type;
	private $file_name;
	private $file_path;
	private $file_size;
	
	function __construct($input_name, $pathname, $baseurl, $allowed_exts) {
		
		$this->pathname = (isset($pathname)) ? $pathname : WP_CONTENT_DIR.'/uploads/';
		$this->baseurl = (isset($baseurl)) ? $baseurl : content_url('uploads/');
		$this->allowed_exts = (isset($allowed_exts)) ? $allowed_exts : '';
		$this->input_name = (isset($input_name)) ? $input_name : 'userfile';
		
		if (!is_dir($this->pathname)) {
			mkdir($this->pathname);
		}
		
	}
	
	/**
	*	@param $text	text to display on buttons; $text[0] is "Choose File" button. $text[1] is "Upload"
		@param $class	classes, if any, to assign to buttons
		@param $ids 	ids to assign to buttons
		@name $data	
	**/
	function get_form_fields($text = array(), $class = array(), $id = array(), $data = array(), $max_size = 30000) {
		$text = (is_array($text)) ? $text : array('Choose File', 'Submit');
		$id = (is_array($id)) ? $id : array($id, $id);
		$class = (is_array($class)) ? $class : array($class, $class);
		
		$this->max_size = (!is_numeric($max_size) || $max_size < 0) ? $max_size : 0;
		$fields = '<input type="hidden" name="MAX_FILE_SIZE" value="'.$this->max_size.'" />';

		$fields .= '<button'; 
		$fields .= ($class[0]) ? ' class="'.$class[0].'"' : '';
		$fields .= ($id[0]) ? ' id="'.$id[0].'"' : '';
		$fields .= '>';
		
		$fields .= '<input name="'.$this->input_name.'" type="file" />';
		$fields .= $text[0].'</button>';	
		
		$fields .= '<button';
		$fields .= ' data-name="'.$this->input_name.'"';
		$fields .= ($class[1]) ? ' class="'.$class[1].'"' : '';
		if (is_array($data)) {
			foreach($data as $key=>$datum)
				$fields .= ($datum) ? ' data-'.$key.'="'.$datum.'"' : '';			
		} 
		
		$this->filter_hook = 'handle_'.$this->input_name.'_upload';
		$fields .= ' data-window="'.$this->input_name.'-window"';
		$fields .= ' data-callback="'.$this->filter_hook.'"';

		$fields .= ($id[1]) ? ' id="'.$id[1].'"' : '';
		$fields .= '>'.$text[1].'</button>';	
		
		//$fields .= '<div class="upload-window"><img id="'.$this->input_name.'-window" class="upload-image" /></div>';

		return $fields;
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
	
	function process_file() {
		$buffer = trim(strip_tags(ob_get_contents()));
		ob_clean();
		
		if ($this->filter_hook) {
			return apply_filters($this->filter_hook, $this->file_url);
		} else {
			return json_encode(array('success'=>true, 'guid'=>esc_url_raw($this->file_url), 'error_buffer'=>$buffer));	
		}
	}
	
	function add_filter($hook, $callback, $priority = 10, $arguments = 1) {
		$this->filter_hook = $hook;
		add_filter($this->filter_hook, $callback, $priority, $arguments);		
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
		ob_start();
		wp_verify_nonce('_file_upload_handler', 'process_user_upload');
		
		$error_code = $_FILES[$this->input_name]["error"];
		if ($error_code != UPLOAD_ERR_OK) {
			return $this->respond(false, $this->load_error_message($error_code));			
		}

		$temp_filename = $_FILES[$this->input_name]['tmp_name'];

		if ($temp_filename) {
			$finfo = new finfo(FILEINFO_MIME_TYPE);
			$this->file_type = $this->approve_mime_type($finfo->file($temp_filename), $temp_filename);
			if (!$this->file_type) {
				return $this->respond(false, 'Not an Approved Mime Type');
			}
		} else {
			return $this->respond(false, 'Not an Approved Mime Type');
		}

		$file_name = strtolower(preg_replace('/[^a-zA-Z0-9\.]/', '_', $_FILES[$this->input_name]["name"]));
		
		if (validate_file($file_name) === 0) {
			$this->file_name = $file_name;
			$this->file_path = $this->pathname.$this->file_name;
		} else {
			return $this->respond(false, 'Invalid filename.');		
		}

		$this->file_size = intval($_FILES[$this->input_name]['size']);
		
		$file_has_been_moved = move_uploaded_file($temp_filename, $this->file_path);
		
		if ($file_has_been_moved) {
			$this->file_url = $this->baseurl.$this->file_name;
			return $this->process_file();			
		} else {
			return $this->respond(false, 'There was a problem moving your file into a new directory');
		}

	}
	
	function respond($success, $message) {
		$buffer = trim(strip_tags(ob_get_contents()));
		ob_clean();
		return json_encode(array('success'=>$success, 'message'=>$message, 'error_buffer'=>$buffer));		
	}

	function set_image_metadata($filepath) {
		//$title, $link_id, $description
		$attachment = array(
			'guid' => $filepath, 
			'post_mime_type' => $this->file_type,
			'post_title' => $title,
			'post_name' => preg_replace('#\-#', '', $title),		
			'post_content' => $description,
			'post_status' => 'inherit'
		);
		
		$attach_id = wp_insert_attachment($attachment, $filepath, HOMEPAGE_ID);
		wp_update_attachment_metadata($id, array('link-id'=>$link_id));	
		require_once( ABSPATH . 'wp-admin/includes/image.php' );
		$attach_data = wp_generate_attachment_metadata( $attach_id, $filepath);
		
		$updated_attachment_metadata = wp_update_attachment_metadata( $attach_id, $attach_data );
		if ($updated_attachment_metadata) {
			return "Successfully Uploded Metadata";
		} else {
			return 0;
		}			
	}
}