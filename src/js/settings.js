const crypto = require('crypto');
const jetpack = require('fs-jetpack');
//const $ = require('jquery');
const {dialog} = require('electron').remote;

var pcLocation;
var ps4Location;
var xb1Location;
const keyPass = 'WarframeFanChannels';
const config = {
    'pc': '',
    'ps4': '',
    'xb1': '',
    'token': '',
    'secret': ''
}
function showPcFileManager(){
    dialog.showOpenDialog({
        defaultPath: 'C:/',
        filters: [{
            name: 'Glyph Codes',
            extensions: ['txt', 'csv']
        }]
    },function(fileLocation){
        pcLocation = fileLocation.toString();
        console.log(pcLocation);
        document.getElementById('pc-input').value = pcLocation;
        // This subfunction needs to have a try catch block
    });
}
function showPs4FileManager(){
    dialog.showOpenDialog({
        defaultPath: 'C:/',
        filters: [{
            name: 'Glyph Codes',
            extensions: ['txt', 'csv']
        }]
    },function(fileLocation){
        pcLocation = fileLocation.toString();
        console.log(ps4Location);
        document.getElementById('ps4-input').value = pcLocation;
    });
}
function showXb1FileManager(){
    dialog.showOpenDialog({
        defaultPath: 'C:/',
        filters: [{
            name: 'Glyph Codes',
            extensions: ['txt', 'csv']
        }]
    },function(fileLocation){
        pcLocation = fileLocation.toString();
        console.log(xb1Location);
        document.getElementById('xb1-input').value = pcLocation;
    });
}
function saveLocations(){
    config['pc'] = pcLocation;
    config['ps4'] = ps4Location;
    config['xb1'] = xb1Location;
    var cipher = crypto.createCipher('sha256', keyPass);

    var cryptConfig = cipher.update(JSON.stringify(config), 'utf8', 'hex');
    cryptConfig += cipher.final('hex');
    console.log(cryptConfig);
    var wd = jetpack.cwd();
    jetpack.write(`${__dirname}/bin/data.init`, cryptConfig);
}
function LoadConfig(){
    var decipher = crypto.createDecipher('sha256', keyPass);
    var loadedConfig = jetpack.read(`${__dirname}/bin/data.init`);
    var decrpt = decipher.update(loadedConfig, 'hex', 'utf8');
    decrpt += decipher.final('utf8');

}
$(document).ready(LoadConfig);
