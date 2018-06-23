var {ipcRenderer} = require('electron');
var T;

ipcRenderer.on('send-twi-keys', function(event, arg) {
    T = arg;
    console.log('Twitter Bot Primed.');
});
ipcRenderer.send('get-twi-keys');

function twitterPost(){
    T.post('statuses/update', {
    	status: 'hello world!'
    }, function(err, data, response) {
    	console.log(data);
    });
    console.log('Post function finished!');
}


function twitterOauth(){
    T.get('account/verify_credentials', {
    		skip_status: true
    	})
    	.catch(function(err) {
    		console.log('caught error', err.stack)
    	})
    	.then(function(result) {
    		// `result` is an Object with keys "data" and "resp".
    		// `data` and `resp` are the same objects as the ones passed
    		// to the callback.
    		// See https://github.com/ttezel/twit#tgetpath-params-callback
    		// for details.

    		console.log('data', result.data);
    	})
}
