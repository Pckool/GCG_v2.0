var Twit = require('twit');
var request = require('request');
var tw;
const twitterAPI = require('node-twitter-api');
var twitter;
var auth;

ipcRenderer.send('get-twi-keys');

function twitterPost(postString) {
    ipcRenderer.send('twitter-post', postString);
}
ipcRenderer.on('twitter-posted-data', (event, arg) => {
    console.log(arg);
});

function twitterOauth() {
    ipcRenderer.send('load-page');
}

ipcRenderer.on('finished-twit-auth', (event, arg) => {
    console.log(arg);

});

ipcRenderer.on('back-to-home', (event, arg) => {
    console.log('Navigating to home page...')
    document.location.href = "#/!";
});
