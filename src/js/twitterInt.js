var {ipcRenderer} = require('electron');
var Twit = require('twit');
var request = require('request');
var tw;

ipcRenderer.on('send-twi-keys', function(event, arg) {
    tw = Twit(arg);
    console.log('Twitter Bot Primed.');
});
ipcRenderer.send('get-twi-keys');

function twitterPost(postString){
    tw.post('statuses/update', {
    	status: 'postString'
    }, function(err, data, response) {
    	console.log(data);
    });
}


function twitterOauth() {
    console.log();
	request({
		url: ' https://api.twitter.com/oauth2/token',
		method: 'POST',
		auth: {
			user: tw.getAuth().consumer_key,
			pass: tw.getAuth().consumer_secret
		},
		form: {
			'grant_type': 'client_credentials'
		}
	}, function(err, res) {
		var json = JSON.parse(res.body);
		console.log("Access Token:", json.access_token);
	});
}
