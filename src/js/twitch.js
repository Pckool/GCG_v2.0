var TwitchApi = require('twitch-api');
var twitch;

getTwitchConfig((dat) => {
    twitch = new TwitchApi({
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        scopes: ['administrator']
    });
});
function getOauthURL(){
    $.ajax({
        url: 'http://localhost:8888/open_browser/twitch',
        type: 'GET',
        data: {
            client_id: $('#client_id').val(),
            permissions: "8",
            scope: "bot"
        },
        success: function(msg) {
            alert('Email Sent');
        }
    });
}

function twitchLogin(){
    twitch.getAccessToken(code, function(err, body){
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
    let twchcfg = {
        "clientId": 'fqvmmi2l6xv4r3hn39tbfk5avtyokf',
        "clientSecret": 'ayjl5fzx5t7nxrf97wia0sy6dil2zq',
        "redirectUri": 'http://localhost:8888/twitch',
        "scopes": ['administrator'],
        "accessToken": ''
    };
}
