<?php
extract($_SERVER);
$api_url = "{$HTTP_HOST}/label-generator/api/users?id=0";

$curl = curl_init();
$options = array(
	CURLOPT_URL=>$api_url,
	CURLOPT_RETURNTRANSFER=>1
);
curl_setopt_array($curl, $options);
$data = curl_exec($curl); 
curl_close($curl);   

echo "var rootUser = new User({$data});";
/*

$backbone_tables = array(
	'label_images' => array(
		'collection' => 'Imgs',
		'url' => 'restful.url + "label_images"',
		
		'options' => array(
			'name'=>'customLabel',
			'pluralName'=>'customLabels',			
			'dropzoneId'=>"#upload-label",
		),
		'data'	=> $data['labelgen_images']
	),
	'logos' => array(
		'collection' => 'Imgs',
		'url' => 'restful.url + "logos"',
		'options' => array(
			'name'=>'dealershipLogo',			
			'pluralName'=>'dealershipLogos',			
			'dropzoneId'=>"#upload-logo",
		),
		'data'	=> $data['labelgen_logos']
	),
	'labels' => array(
		'collection' => 'Labels',
		'url' => 'restful.url + "labels"',
		'options' => array(),
		'data'	=> $data['labelgen_labels']
	),
	'models' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "models"',
		'options' => array(),
		'data'	=> $data['labelgen_models']
	),
	'makes' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "makes"',
		'options' => array(),
		'data'	=> $data['labelgen_makes']
	),
	'years' => array(
		'collection' => 'Object',
		'url' => 'restful.url + "years"',
		'options' => array(),
		'data'	=> $data['labelgen_years']
	),
	'exterior_options' => array(
		'collection' => 'Options',
		'url' => 'restful.url + "options?location=exterior"',
		'options' => array(
			"location"=>"exterior"
		),
		'data' => $data['exterior_options']
	),
	'interior_options' => array( 
		'collection' => 'Options',
		'url' => 'restful.url + "options?location=interior"',
		'options' => array(
			"location"=>"interior"
		),
		'data'	=> $data['interior_options']
	),
	'discounts' => array( 
		'collection' => 'Discounts',
		'url' => 'restful.url + "discounts"',
		'options' => array(),
		'data'	=> $data['labelgen_discounts']
	)
);

echo "var App = {};\n";
foreach ($backbone_tables as $key => $table) {	
	echo "\tApp.".$key." = new ".$table['collection']." ([\n";
	foreach($table['data'] as $row) {
		if (is_object($row) || is_array($row)) {
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
			} else {
				break;
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
			} else {
				break;
			}
		}
	}
	
	echo "});\n\n";
}
*/

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
?>