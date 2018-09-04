var TwitchJS = require('twitch-js');
var twitchOptions = {
    options: {
        clientId: '03ppab2gojuahyr7ouocpnbclbhof7',
    },
    channels: ['someUserName']
}
var twitchConfig = {
    client_id: '03ppab2gojuahyr7ouocpnbclbhof7',
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
    ipcRenderer_dis.send('open-browser2', {url: `https://api.twitch.tv/kraken/oauth2/authenticate?client_id=${twitchConfig.client_id}&redirect_uri=${twitchConfig.redirect_uri}&response_type=${twitchConfig.response_type}&scope=${twitchConfig.scope}&force_verify=true`});
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

function getTwitchConfig(){
    ipcRenderer.send('get-data-twch');
    ipcRenderer.once('loaded-data-twch', (event, data) => {
        console.log(JSON.parse(data));
    });
}
function resetTwitchConfig(){
    ipcRenderer.send('reset-data-twch');    // Reset Twitch
}

app.controller('twitchSettingsController', function($scope) {
    console.log('We are in twitch settings');
    $('#gen-oauth-twch').click(getTwitchAuth);
});
