<?php
define('API_PATH', 'http://www.taglinemediagroup.com/monroney/label-generator/api/');

$backbone_tables = array(
	'label_images' => array(
		'collection' => 'Imgs',
		'url' => 'restful.url + "label_images"',
		'options' => array(),
		'data'	=>	json_decode(file_get_contents(API_PATH.'label_images'))
	),
	'models' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "models"',
		'options' => array(),
		'data'	=>	json_decode(file_get_contents(API_PATH.'models'))
	),
	'makes' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "makes"',
		'options' => array(),
		'data'	=> json_decode(file_get_contents(API_PATH.'makes'))
	),
	'years' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "years"',
		'options' => array(),
		'data'	=> json_decode(file_get_contents(API_PATH.'years'))
	),
	'exterior_options' => array(
		'collection' => 'Options',
		'url' => 'restful.url + "options?location=exterior"',
		'options' => array(
			"location"=>"exterior"
		),
		'data' => json_decode(file_get_contents(API_PATH.'options&location=exterior'))
	),
	'interior_options' => array( 
		'collection' => 'Options',
		'url' => 'restful.url + "options?location=interior"',
		'options' => array(
			"location"=>"interior"
		),
		'data'	=> json_decode(file_get_contents(API_PATH.'options&location=interior'))
	),
	'discounts' => array( 
		'collection' => 'Discounts',
		'url' => 'restful.url + "discounts"',
		'options' => array(),
		'data'	=> json_decode(file_get_contents(API_PATH.'discounts'))
	)
);

echo "var App = {};\n";
foreach ($backbone_tables as $key => $table) {	
	echo "\tApp.".$key." = new ".$table['collection']." ([\n";
	foreach($table['data'] as $row) {
		if (is_object($row)) {
			echo "\t\t{";
			foreach($row as $key => $value) {
				if (!$value) {
					echo $key.': 0';				
				} elseif (is_numeric($value)) {
					echo $key.': '.$value;
				} else {
					echo $key.': "'.$value.'"';
				}
				
				if ($value != end($row)) {
					echo ', ';
				}
			}
			echo "}";
			if ($row != end($table['data'])) {
				echo ",\n";
			}
		}
	}
	echo "\n\t\t],"; 
	echo "{url: ".$table['url'];
	if (is_array($table['options']) && count($table['options']) > 0) {
		echo ", ";
		foreach ($table['options'] as $name=>$value) {
			if (!$value) {
				echo $name.': 0';				
			} elseif (is_numeric($value)) {
				echo $name.': '.$value;
			} else {
				echo $name.': "'.$value.'"';
			}
			if ($value != end($table['options'])) {
				echo ", ";
			}
		}
	}
	
	echo "});\n\n";
}
?>