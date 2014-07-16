<?php
/** Plugin Name: PDF Label Maker 
*	Author: Kellan Cummings
*/
define('LABEL_MAKER_ROOT', dirname(__FILE__));
define('LABEL_MAKER_URL', plugins_url().'/label-maker'); 


require_once(LABEL_MAKER_ROOT.'/lib/fpdf/fpdf.php');
require_once(LABEL_MAKER_ROOT.'/models/generator.php');	
require_once(LABEL_MAKER_ROOT.'/lib/restful-api/labelgen-api.php');

add_action('wp_enqueue_scripts', function() {

	wp_enqueue_script('jquery');	
	wp_enqueue_script('underscore');	
	wp_deregister_script('backbone');
	wp_enqueue_script('backbone', LABEL_MAKER_URL.'/js/lib/backbone/backbone.js', array('underscore', 'jquery'));
	wp_enqueue_script('backbone_full_extend', LABEL_MAKER_URL.'/js/backbone-fullExtend.js', array('underscore', 'jquery', 'backbone'));
	
	wp_enqueue_style('label_generator_css', LABEL_MAKER_URL.'/css/style.css');
	wp_enqueue_style('modal_css', LABEL_MAKER_URL.'/js/modal/modal.css');
	wp_enqueue_script('modal_js', LABEL_MAKER_URL.'/js/modal/modal.js', array('backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);	
	
	wp_enqueue_script('label_generator_label_js', LABEL_MAKER_URL.'/js/generator-label.js', array('backbone', 'underscore', 'modal_js', 'jquery', 'backbone_full_extend'), null, true);
	wp_enqueue_script('label_generator_vehicle_js', LABEL_MAKER_URL.'/js/generator-vehicle.js', array('label_generator_label_js', 'backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);
	wp_enqueue_script('label_generator_option_js', LABEL_MAKER_URL.'/js/generator-option.js', array('label_generator_label_js', 'backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);
	wp_enqueue_script('label_generator_image_js', LABEL_MAKER_URL.'/js/generator-image.js', array('label_generator_label_js', 'backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);
	wp_enqueue_script('label_generator_discount_js', LABEL_MAKER_URL.'/js/generator-discount.js', array('label_generator_label_js', 'backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);
	
	wp_enqueue_script('backbone-data', LABEL_MAKER_URL.'/js/backbone-data.php', array('label_generator_label_js', 'backbone', 'underscore', 'jquery', 'label_generator_vehicle_js', 'label_generator_discount_js', 'label_generator_option_js', 'label_generator_image_js', 'backbone_full_extend'), null, true);

	wp_enqueue_script('label_generator_js', LABEL_MAKER_URL.'/js/generator.js', array('backbone-data'), null, true);
	
	wp_localize_script('label_generator_label_js', 'label', array(
		'colors'=>array('blue'=>'#23498a', 'green'=>'#24a649', 'red'=>'#bf2026', 'gray'=>'#929491', 'black'=>'#000000')
	));
	
	wp_localize_script('label_generator_label_js', 'ajax', array(
		'action'=>'do_generator_action', 'url'=>get_admin_url(get_current_blog_id(), 'admin-ajax.php')
	));
	
	wp_localize_script('label_generator_label_js', 'restful', array(
		'url'=>get_admin_url(get_current_blog_id(), 'label-generator/api/')
	));

});

add_shortcode('add_label_generator', function($args) {
	ob_start();

	require_once(LABEL_MAKER_ROOT.'/views/generator.php');
	
	$content = ob_get_contents();
	ob_end_clean();

	return $content; 
}, 1);

add_action('wp_ajax_nopriv_do_generator_action', 'do_generator_action');
add_action('wp_ajax_do_generator_action', 'do_generator_action');

function do_generator_action() {
	//show_request_variables();
	call_user_func($_POST['callback']);
}

function show_request_variables() {
	echo "\nFILES: ";
	print_r($_FILES);
	echo "\nGET: ";
	print_r($_GET);	
	echo "\nPOST: ";
	print_r($_POST);
}

function handle_dealershipLogo_upload() {
	$u_handler = get_user_upload_handler($_POST['name']);
	echo $u_handler->process_user_upload();	
	exit;
}

function handle_customLabel_upload() {
	$u_handler = get_user_upload_handler($_POST['name']);
	//show_request_variables();
	$caption = $_POST['labelCaption'];

	$function = function($file_url) use ($caption) {
		return json_encode(array( 'guid'=> esc_url_raw($file_url), 'caption' => $caption));
	};
	
	$u_handler->add_filter('handle_customLabel_upload', $function);
	
	echo $u_handler->process_user_upload();	
	exit;
}

function get_user_upload_handler($name) {
	require_once(LABEL_MAKER_ROOT.'/lib/file-upload-handler.php'); 

	$pathname = WP_CONTENT_DIR.'/uploads/label-generator/'.$name.'/';
	$baseurl = content_url('uploads/label-generator/'.$name.'/');
	$allowed_exts = array("image"=>array("gif", "jpeg", "jpg", "pjpeg", "x-png", "bmp", "tiff", "png"));	
	
	$u_handler = new File_Upload_Handler($name, $pathname, $baseurl, $allowed_exts);			
	return $u_handler;
}

register_activation_hook(__FILE__, function() {
	global $wpdb;
	
	require_once(ABSPATH.'wp-admin/includes/upgrade.php' );
	require_once(LABEL_MAKER_ROOT.'/lib/xml-parser/xml-parser.php');
	
	$tables = KBC_XML_Parser::parse_file(LABEL_MAKER_ROOT.'/data/tables.xml');	

	foreach($tables as $tbl_name=>$tbl) {
		$wpdb->query($wpdb->prepare('SHOW TABLES LIKE %s', $tbl_name)); 	
		if (!$wpdb->last_result) {
			
			$sql = "CREATE TABLE IF NOT EXISTS ".$tbl_name." 
				(id mediumint(9) NOT NULL AUTO_INCREMENT UNIQUE, 
				time datetime DEFAULT '0000-00-00 00:00:00' NOT NULL, ";

			foreach($tbl as $col_name => $col) {
				$sql .= $col_name.' '.$col['type'];
				$sql .= (isset($col['options'])) ? ' '.$col['options'].', ' : ', ';
			}
			$sql .= ' PRIMARY KEY(id))';
			dbDelta( $sql );	
		}
	}
});


//4 1/16" by 10 1/4"
//register_activation_hook('', '');


?>
