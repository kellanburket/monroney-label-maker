<?php
/** Plugin Name: PDF Label Maker 
*	Author: Kellan Cummings
*/
$uploads = wp_upload_dir();
define('LABEL_MAKER_ROOT', dirname(__FILE__));
define('LABEL_MAKER_URL', plugins_url().'/label-maker'); 
define('LABEL_MAKER_UPLOADS', $uploads['basedir'].'/label-generator/customLabel'); 
define('MONRONEY_LABEL_GENERATOR_ACTION', 'do_monroney_label_generator_action');
require_once(LABEL_MAKER_ROOT.'/lib/fpdf/fpdf.php');
require_once(LABEL_MAKER_ROOT.'/models/generator.php');	
require_once(LABEL_MAKER_ROOT.'/lib/restful-api/labelgen-api.php');






add_action('wp_enqueue_scripts', function() {

	wp_enqueue_script('jquery');	
	wp_enqueue_script('underscore');	
	wp_deregister_script('backbone');
	wp_enqueue_script('backbone', LABEL_MAKER_URL.'/js/lib/backbone/backbone.js', array('underscore', 'jquery'));
	wp_enqueue_script('backbone_full_extend', LABEL_MAKER_URL.'/js/backbone-fullExtend.js', array('underscore', 'jquery', 'backbone'));
	wp_enqueue_script('handlebars', LABEL_MAKER_URL.'/js/lib/handlebars-v1.3.0.js');
	wp_enqueue_script('pdf_js', LABEL_MAKER_URL.'/js/lib/pdf.js/build/generic/build/pdf.js');
	wp_enqueue_script('compatability_js', LABEL_MAKER_URL.'/js/lib/pdf.js/build/generic/web/compatibility.js', 'pdf_js');
	
	wp_enqueue_style('label_generator_css', LABEL_MAKER_URL.'/css/style.css');
	wp_enqueue_style('modal_css', LABEL_MAKER_URL.'/js/modal/modal.css');
	wp_enqueue_script('modal_js', LABEL_MAKER_URL.'/js/modal/modal.js', array('backbone', 'underscore', 'jquery', 'backbone_full_extend'), null, true);	
	
	wp_enqueue_script('label_generator_label_js', LABEL_MAKER_URL.'/js/generator-label.js', array('backbone', 'handlebars', 'underscore', 'modal_js', 'jquery', 'backbone_full_extend'), null, true);
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
		'action'=>MONRONEY_LABEL_GENERATOR_ACTION, 'url'=>get_admin_url(get_current_blog_id(), 'admin-ajax.php')
	));
	
	wp_localize_script('label_generator_label_js', 'restful', array(
		'url'=>get_site_url(get_current_blog_id(), 'label-generator/api/')
		//'url'=>get_admin_url(get_current_blog_id(), 'label-generator/api/')
	));
	wp_localize_script('label_generator_label_js', 'modal_ext', array(
		'url'=>plugins_url().'/label-maker/js/modal/'
	));
	wp_localize_script('label_generator_label_js', 'pdfjs_ext', array(
		'url'=>plugins_url().'/label-maker/js/lib/pdf.js/build/'
	));
});

add_shortcode('add_label_generator', function($args) {
	ob_start();

	require_once(LABEL_MAKER_ROOT.'/views/generator.php');
	
	$content = ob_get_contents();
	ob_end_clean();

	return $content; 
}, 1);

add_action('wp_ajax_nopriv_'.MONRONEY_LABEL_GENERATOR_ACTION, MONRONEY_LABEL_GENERATOR_ACTION);
add_action('wp_ajax_'.MONRONEY_LABEL_GENERATOR_ACTION, MONRONEY_LABEL_GENERATOR_ACTION);

function do_monroney_label_generator_action() {
	//show_request_variables();

	call_user_func($_POST['callback']);
}

function generate_pdf_label() {
	$elements = json_decode(stripslashes($_POST['elements']), true);
	$root_element = json_decode(stripslashes($_POST['root_element']), true);
	$scale = floatval($_POST['scale']);
	
	$filepath = LABEL_MAKER_ROOT . '/pdfs/test.pdf';
	$fileurl = LABEL_MAKER_URL . '/pdfs/test.pdf';

	$gen = new PDFAddendumGenerator($root_element, $elements, $filepath, $fileurl, $scale, 18, 18);
	echo json_encode(array('pdf'=>$gen->get_url(), 'success'=>true, 'width'=>$gen->get_output_width(), 'height'=>$gen->get_output_height()));
	exit;
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
				time timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, ";

			foreach($tbl as $col_name => $col) {
				$sql .= $col_name.' '.$col['type'];
				$sql .= (isset($col['options'])) ? ' '.$col['options'].', ' : ', ';
			}
			$sql .= ' PRIMARY KEY(id))';
			dbDelta( $sql );	
		}
	}

	$rules = "\n# BEGIN LABELGEN API\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule label-generator/api/(.*)$ ".plugins_url()."/label-maker/lib/restful-api/request.php?request=$1 [QSA,NC,L]\n</IfModule>\n# END LABELGEN API";

	$htaccess = fopen('.htaccess', 'c+'); 
	//$bytes = fwrite($htaccess, $rules);
	$learn = false;
	while (!feof($htaccess)) {
		$line = fgets($htaccess);
		if (preg_match('/BEGIN WordPress/i', $line)) {
			$pos = ftell($htaccess) - strlen($line);
			$learn = true;			
			$rules .= "\n";
		}	
		if ($learn) {
			$rules .= (string) $line;
		}
	}	
	if ($pos || $pos === 0) {
		//echo $rules;
		fseek($htaccess, $pos);
		fwrite($htaccess, $rules);		
	}


});




//4 1/16" by 10 1/4"
?>
