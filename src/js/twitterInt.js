var Twit = require('twit');
var request = require('request');
var tw;
const twitterAPI = require('node-twitter-api');
var twitter;
var auth;

ipcRenderer.send('get-twi-keys');

function twitterPost(postString) {
    ipcRenderer.send('post', postString);
}

function twitterOauth() {
    ipcRenderer.send('load-page');
}

ipcRenderer.on('loaded-page', (event, arg) => {
    console.log(arg);
});
