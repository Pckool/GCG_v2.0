//import { remote, dialog } from 'electron';
// var remote = require('remote');
// var dialog = remote.require('dialog');
const {dialog} = require('electron').remote;

function showFileManager(){
    dialog.showOpenDialog(function(){
        Console.log();
    });
}
