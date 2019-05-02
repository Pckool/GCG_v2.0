const fs = require('fs');
const url = require('url');
const {ipcRenderer} = require('electron');
const $ = require('jquery');
const {dialog} = require('electron').remote;
var bLauncher = require('launch-browser');        // Launch-Browser

// window.$ = window.jQuery = require('jquery'); // not sure if you need this at all
window.Popper = require('popper.js'); 
window.Bootstrap = require('bootstrap');

var coreSettings;



function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function notify(notification){
    $('#notify').toggleClass('trans-black');
    $('#notify-text').text(notification);
    setTimeout( () => {
        $('#notify').toggleClass('trans-black');
        $('#notify-text').text('');
    }, 3000 );
}
