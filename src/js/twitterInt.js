var {ipcRenderer} = require('electron');
var Twit = require('twit');
var request = require('request');
var tw;
var twitter;
const OauthTwitter = require('electron-oauth-twitter'); // eslint-disable-line global-require
var auth;
const twitterAPI = require('node-twitter-api');


ipcRenderer.on('send-twi-keys', function(event, arg) {
	tw = Twit(arg);
    twitter = new twitterAPI({
        consumerKey: arg.consumer_key,
        consumerSecret: arg.consumer_secret,
        callback: 'http://localhost:8888'
    });
    console.log(arg);
    //tw = new OauthTwitter(arg);
    //info = new twitter(arg.consumer_key, arg.consumer_secret);
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
    var accessTokenSecret;
	// request({
	// 	url: 'https://api.twitter.com/oauth/request_token',
	// 	method: 'GET',
	// 	auth: {
	// 		user: tw.getAuth().consumer_key,
	// 		pass: tw.getAuth().consumer_secret
	// 	},
	// 	form: {
	// 		'grant_type': 'client_credentials'
	// 	}
	// }, function(err, res) {
    //     if(err){
    //         console.log(err)
    //     }
    //     else if(res){
    //         //var response = JSON.parse(res.body);
    //         console.log(res);
    // 		console.log("Access Token:" + response.access_token);
    // 		accessToken = response.access_token;
    // 		request({
    // 			url: 'https://api.twitter.com/oauth/authorize',
    // 			auth: {
    // 				'bearer': accessToken
    // 			}
    // 		}, function(err, res) {
    // 			console.log(res.body);
    //             jetpack.write(`${__dirname}/twitauth.html`, res.body);
    //             ipcRenderer.send('load-page', accessToken);
    // 		});
    //     }
    //     else{
    //         console.log('There was some unknown issue.')
    //     }
    //
	// });

    twitter.getRequestToken( (err, requestToken, requestTokenSecret, results) => {
        if(err){
            console.log('Error getting the OAuth request Token...');
        }
        else{
            fs.readFile(`${__dirname}/bin/tw.dat`, function(err, data){
                let dat = JSON.parse(data);
                dat.request_token = requestToken
                dat.request_secret = requestTokenSecret

                fs.writeFile(`${__dirname}/bin/tw.dat`, JSON.stringify(dat), (err) => {
                    if(err) throw err;
                    console.log('Updated Twitter Auth Data');
                });
            });
            ipcRenderer.send('load-page', requestToken);
        }
    });
}
ipcRenderer.on('loaded-page', (event, arg) => {
    console.log(arg);
    //ipcRenderer.send('open-login', info);
});
ipcRenderer.on('store-keys', (event, arg) => {
    console.log('proceed with key storage');
});
ipcRenderer.on('store-keys2', (event, arg) => {
    console.log('proceed with key storage');
    console.log(arg);
    config['token'] = arg.token;
    config['secret'] = arg.secret;
});
