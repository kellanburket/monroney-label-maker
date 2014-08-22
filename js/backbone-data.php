<?php
//error_reporting (E_ALL);
$user = "admin";
$pw = "Wh005eAfra!d0fV!rginaW0Olf?";

//echo json_encode($_SERVER);
//exit;

$api_url = "{$_SERVER['HTTP_HOST']}/addendum-generator/api/users/{$user}";

$date = date("D, d M Y H:i:s T");
//$encoded_date = urlencode($date);
//$nonce = uniqid();
//$msg = "GET+{$api_url}+{$encoded_date}+{$nonce}";
//$hash = hash_hmac('sha1', $msg, $pw);
//$digest = base64_encode($hash);

$headers = array(
	//"Authentication: hmac {$user}:{$nonce}:{$digest}",
	"Date: {$date}",
	"Content Type: application/json; charset=utf-8",
	"Accept: application/json",
);

$post_fields = array(
	'loginPassword'=> $pw
);
$post_fields_string = json_encode($post_fields);
$curl = curl_init();

$options = array(
	CURLOPT_URL				=>	$api_url,
	CURLOPT_RETURNTRANSFER	=>	1,
	CURLOPT_POST			=>	count($post_fields),
	CURLOPT_POSTFIELDS		=>	$post_fields_string,
	CURLOPT_HTTPHEADER 		=>	$headers
);

curl_setopt_array($curl, $options);
$data = curl_exec($curl); 
curl_close($curl);   

echo $data;

//"var rootUser = new User({$data}, {parse: 'true'});";

?>