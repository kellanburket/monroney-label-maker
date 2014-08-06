<?php
// Requests from the same server don't have a HTTP_ORIGIN header
define('WP_USE_THEMES', false);
global $wp, $wp_query, $wp_the_query, $wp_rewrite, $wp_did_header;
require(dirname(__FILE__).'/../../../../../wp-load.php');
require_once('labelgen-api.php');

if (!array_key_exists('HTTP_ORIGIN', $_SERVER)) {
    $_SERVER['HTTP_ORIGIN'] = $_SERVER['SERVER_NAME'];
}
try {
    $API = new labelgen_api($_REQUEST['request'], $_SERVER['HTTP_ORIGIN']);
	echo $API->processAPI();
} catch (Exception $e) {
    echo json_encode(array('succes'=>false, 'message' => $e->getMessage()));
}

?>