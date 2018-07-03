const fs = require('fs');
const url = require('url');
const {ipcRenderer} = require('electron');
const $ = require('jquery');
const {dialog} = require('electron').remote;

var config;



function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}
