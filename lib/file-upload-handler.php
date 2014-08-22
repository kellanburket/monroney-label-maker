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