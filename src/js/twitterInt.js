var {ipcRenderer} = require('electron');
var Twit = require('twit');
var request = require('request');
var tw;

ipcRenderer.on('send-twi-keys', function(event, arg) {
	tw = Twit(arg);
	console.log('Twitter Bot Primed.');
});
ipcRenderer.send('get-twi-keys');

function twitterPost(postString) {
	tw.post('statuses/update', {
		status: 'postString'
	}, function(err, data, response) {
		console.log(data);
	});
}


function twitterOauth() {
	var accessToken;
	request({
		url: 'https://api.twitter.com/oauth2/token',
		method: 'POST',
		auth: {
			user: tw.getAuth().consumer_key,
			pass: tw.getAuth().consumer_secret
		},
		form: {
			'grant_type': 'client_credentials'
		}
	}, function(err, res) {
		var response = JSON.parse(res.body);
		console.log("Access Token:", response.access_token);
		accessToken = response.access_token;
		request({
			url: 'https://api.twitter.com/oauth/authorize',
			auth: {
				'bearer': accessToken
			}
		}, function(err, res) {
			console.log(res.body);
            ipcRenderer.send('load-page', res.body);
		});
	});


}
