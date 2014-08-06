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
		
		
	}
	
	/**
	*	@param $text	text to display on buttons; $text[0] is "Choose File" button. $text[1] is "Upload"
		@param $class	classes, if any, to assign to buttons
		@param $ids 	ids to assign to buttons
		@name $data	
	**/
	function get_form_fields($text, $class = array(), $id = array(), $data = array(), $max_size = 30000) {
		$text = ($text) ? $text : 'Upload';
		$id = (is_array($id)) ? $id : array($id, $id);
		$class = (is_array($class)) ? $class : array($class, $class);
		
		//$this->max_size = (!is_numeric($max_size) || $max_size < 0) ? $max_size : 0;
		//$fields = '<input type="hidden" name="MAX_FILE_SIZE" value="'.$this->max_size.'" />';
		/*
		$fields .= '<button'; 
		$fields .= ($class[0]) ? ' class="'.$class[0].'"' : '';
		$fields .= ($id[0]) ? ' id="'.$id[0].'"' : '';
		$fields .= '>';
		
		$fields .= '<input name="'.$this->input_name.'" type="file" />';
		$fields .= $text[0].'</button>';	
		
		$fields .= '<button';
		*/
		
		$fields = '<form action="api/label_images" ';
		$fields .= ($id[1]) ? ' id="'.$id[1].'"' : '';
		$fields .= ' data-name="'.$this->input_name.'"';
		$fields .= ($class[1]) ? ' class="'.$class[1].'"' : '';
		if (is_array($data)) {
			foreach($data as $key=>$datum)
				$fields .= ($datum) ? ' data-'.$key.'="'.$datum.'"' : '';			
		} 

		$this->filter_hook = 'handle_'.$this->input_name.'_upload';
		$fields .= ' data-window="'.$this->input_name.'-window"';
		$fields .= ' data-callback="'.$this->filter_hook.'"';

		$fields .= ">< {$text} ></form>";	
		
		return $fields;
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