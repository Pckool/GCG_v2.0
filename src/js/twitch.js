var TwitchJS = require('twitch-js');
var twitchOptions = {
    options: {
        clientId: 'aqj40giuob8eeeed61a01ath7dn9f2',
    },
    channels: ['someUserName']
}
var twitchConfig = {
    client_id: 'aqj40giuob8eeeed61a01ath7dn9f2',
    redirect_uri: 'http://localhost:8888/twitch-passport',
    response_type: 'code',
    scope: 'channel_subscriptions channel_check_subscription'
}
var twitchClient;

function getTwitchConfig(dat) {
    twitchClient = new TwitchJS.client(options);
}

function getTwitchAuth(){
    if(twitchClient){
        twitchClient.api({
            url: 'https://api.twitch.tv/kraken?client_id',
            headers: {
                'Client-ID': twitchOptions.options.clientId
            }
        },
        function (err, res, body){
            console.log(body);
        });
    }
    console.log('I got here!');
    ipcRenderer_dis.send('open-browser2', {url: `https://api.twitch.tv/kraken/oauth2/authenticate?client_id=${twitchConfig.client_id}&redirect_uri=${twitchConfig.redirect_uri}&response_type=${twitchConfig.response_type}&scope=${twitchConfig.scope}`});
}

function twitchLogin(){
    twitchClient.getAccessToken(code, function(err, body){
        if (err){
          console.log(err);
        } else {
          /*
          * body = {
          *   access_token: 'your authenticated user access token',
          *   scopes: [array of granted scopes]
          * }
          */
        }
    });
}

function getTwitchConfig(callback){

}

app.controller('twitchSettingsController', function($scope) {
    console.log('We are in twitch settings');
    $('#gen-oauth-twch').click(getTwitchAuth);
});
