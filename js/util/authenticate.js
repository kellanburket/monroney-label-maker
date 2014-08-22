define(['crypto-js/enc-base64', 'crypto-js/hmac-sha1', 'util/uniqid'], function(Base64, HmacSHA1, uniqid) {
	return function(user, url, method) {
		var secret = user.get('secret');
		var user_name = user.get('name'); 

		console.log(user_name, secret, url, method);

		var nonce = uniqid(5);
		var msg = method + "+" + url + "+" + nonce;
		var hash = HmacSHA1(msg, secret);
		var digest = hash.toString(Base64);			
		return "hmac " + user_name + ":" + nonce + ":" + digest;
	};
});

