<?php
/** Plugin Name: PDF Label Maker 
*	Author: Kellan Cummings
*	Version: 2.0
*/
$uploads = wp_upload_dir();
define('LABEL_MAKER_ROOT', dirname(__FILE__));
define('LABEL_MAKER_URL', plugins_url().'/label-maker'); 

define('LABEL_MAKER_UPLOADS', $uploads['basedir'].'/label-maker/user_data'); 
define('LABEL_MAKER_UPLOADS_URL', $uploads['baseurl'].'/label-maker/user_data'); 

define('DEVELOPMENT', 1);
define('LIVE', 2);
define('LIFECYCLE', DEVELOPMENT);


define('MONRONEY_LABEL_GENERATOR_ACTION', 'do_monroney_label_generator_action');

require_once(LABEL_MAKER_ROOT.'/lib/fpdf/fpdf.php');
require_once(LABEL_MAKER_ROOT.'/models/generator.php');	
require_once(LABEL_MAKER_ROOT.'/lib/restful-api/labelgen-api.php');

add_filter('clean_url', function($url) {
    if (preg_match('/.*\/r.js.*/', $url)) {
       $url ="{$url}' data-main='wp-content/plugins/label-maker/js/main.js";
	   return $url;
    } else {
    	return $url;
    }	
}, 11, 1 );

add_action('wp_enqueue_scripts', function() {
	global $post;

	if ($post->post_name == "addendum-generator") {		
		global $wp_scripts;
		
		if (array_key_exists('contact-form-7', $wp_scripts->registered)) {
			wp_deregister_script('contact-form-7');		
			unset($wp_scripts->registered['contact-form-7']);
		}
		
		wp_enqueue_script('jquery');	
		wp_deregister_script('backbone');
		//wp_deregister_script('underscore');
		//wp_register_script('underscore');
		//wp_enqueue_script('backbone', LABEL_MAKER_URL.'/js/lib/backbone/backbone.js', array('underscore'));
		wp_enqueue_script('require_js', LABEL_MAKER_URL."/js/r.js", array('jquery', 'pdf_js'));	
		switch (LIFECYCLE) {
			case(DEVELOPMENT):
				wp_enqueue_script('pdf_js', LABEL_MAKER_URL."/js/lib/pdf.js/pdf.js");	
				wp_enqueue_script('compatibility_js', LABEL_MAKER_URL."/js/lib/pdf.js/compatibility.js", array('pdf_js'));	
				break;
			case(LIVE):
				wp_enqueue_script('pdf_js', LABEL_MAKER_URL."/js/lib/pdf.js/build/generic/build/pdf.js");	
				wp_enqueue_script('compatibility_js', LABEL_MAKER_URL."/js/lib/pdf.js/build/generic/web/compatibility.js", array('pdf_js'));	
				break;
		}
		
		wp_enqueue_style('label_generator_css', LABEL_MAKER_URL.'/css/style.css');
		wp_enqueue_style('modal_css', LABEL_MAKER_URL.'/js/lib/modal/modal.css');

		wp_localize_script('require_js', 'label', array(
			'colors'=>array('blue'=>'#23498a', 'green'=>'#24a649', 'red'=>'#bf2026', 'gray'=>'#929491', 'black'=>'#000000')
		));
		
		wp_localize_script('require_js', 'ajax', array(
			'action'=>MONRONEY_LABEL_GENERATOR_ACTION, 'url'=>get_admin_url(get_current_blog_id(), 'admin-ajax.php')
		));
		
		wp_localize_script('require_js', 'restful', array(
			'url'=>get_site_url(get_current_blog_id(), 'addendum-generator/api/')
			//'url'=>get_admin_url(get_current_blog_id(), 'label-generator/api/')
		));
		wp_localize_script('require_js', 'modal_ext', array(
			'url'=>plugins_url().'/label-maker/js/lib/modal/'
		));

		wp_localize_script('require_js', 'DEBUG', array('MODE'=>(LIFECYCLE == LIVE) ? false : true));

		wp_localize_script('require_js', 'pdfjs_ext', array(
			'url'			=>	(LIFECYCLE == LIVE) ? plugins_url().'/label-maker/js/lib/pdf.js/build/' : plugins_url().'/label-maker/js/lib/pdf.js/',
			'worker_url' 	=> 	(LIFECYCLE == LIVE) ? plugins_url().'/label-maker/js/lib/pdf.js/build/generic/build/pdf.worker.js' : plugins_url().'/label-maker/js/lib/pdf.js/pdf.worker.js'
		));
		wp_localize_script('require_js', 'backbone_data', array(
			'url'=>plugins_url().'/label-maker/js/backbone-data.php'
		));
	}

});


add_shortcode('add_addendum_generator', function($args) {
	ob_start();

	require_once(LABEL_MAKER_ROOT.'/views/generator.php');
	
	$content = ob_get_contents();
	ob_end_clean();

	echo $content; 
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
	$username = sanitize_text_field($_POST['username']);
	$labelname = sanitize_text_field($_POST['labelname']);
	$center = !$_POST['preview'];

	global $wpdb;
	$wpdb->query($wpdb->prepare('SELECT id FROM labelgen_users WHERE name = %s', $username));
	
	if ($wpdb->last_result) {
		$filename = sanitize_file_name($labelname);

		if (!$filename) $filename = "default";
		
		register_addendum_generator_directories($username);

		$filepath = LABEL_MAKER_UPLOADS;
		$fileurl = LABEL_MAKER_UPLOADS_URL;
	
		$gen = new PDFAddendumGenerator($root_element, $elements, $filepath, $fileurl, $labelname, $username, $scale, $center);
		echo json_encode(array('pdf'=>$gen->get_url(), 'success'=>true, 'message'=>'Please Wait While We Load Your Printable PDF..', 'width'=>$gen->get_output_width(), 'height'=>$gen->get_output_height()));
		exit;
	} else {
		echo json_encode(array('success'=>false, 'message'=>'Invalid Username.'));	
	}
	
}


function register_uploads_directory($path) {
	if (!file_exists($path)) {
		mkdir($path);	
	}
}

function register_addendum_generator_directories($username = NULL) {
	$uploads = wp_upload_dir();
	$path = "{$uploads['basedir']}/label-maker";
	register_uploads_directory($path);
	$path .= "/user_data";
	register_uploads_directory($path);
	$path .= "/labels";
	register_uploads_directory($path);

	
	if (!is_null($username)) {
		$path .= "/{$username}";

		register_uploads_directory($path);
	}
}


register_activation_hook(__FILE__, function() {
	global $wpdb;
	register_addendum_generator_directories();
	
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

	$rules = "\n# BEGIN LABELGEN API\n<IfModule mod_rewrite.c>\nRewriteEngine On\nRewriteBase /\nRewriteCond %{REQUEST_FILENAME} !-f\nRewriteCond %{REQUEST_FILENAME} !-d\nRewriteRule addendum-generator/api/(.*)$ ".plugins_url()."/label-maker/lib/restful-api/request.php?request=$1 [QSA,NC,L]\n</IfModule>\n# END LABELGEN API";

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

function to_string($vars, $id = null, $depth = 0) {
	if (!is_null($id)) {
		echo "<p><strong>{$id}:</strong>";
	}
	$recursive_read = function($key, $val, $depth, $callback) {
		$indent = 10 * $depth;
		$css = "style='text-indent: {$indent}px; line-height:10px;'";
		if (is_string($val) || is_numeric($val)) {
			echo "<p {$css}><strong>{$key}:</strong> {$val}</p>";
		} else if (is_array($val) || is_object($val)) {
			echo "<p {$css}><strong>{$key}</strong>: </p>";
			++$depth;
			foreach($val as $a=>$b) {
				call_user_func_array($callback, array($a, $b, $depth, $callback));
			}
		}
	};

	if (is_array($vars) || is_object($vars)) {
		echo "</p>";
		foreach($vars as $k=>$v) {
			call_user_func_array($recursive_read, array($k, $v, $depth, $recursive_read));
		}
	} else {
		echo ": {$vars}</p>"; 		
	}
}

//4 1/16" by 10 1/4"
?>
