const crypto = require('crypto');
const jetpack = require('fs-jetpack');
//const $ = require('jquery');
const {dialog} = require('electron').remote;

var pcLocation;
var ps4Location;
var xb1Location;
const keyPass = 'WarframeFanChannels';
var config = {
    'pc': '',
    'ps4': '',
    'xb1': '',
    'token': '',
    'secret': ''
}
app.controller('settingsController', function($scope){
    document.onresize = correctContSize;

    $scope.populateBoxes = function($scope){
        $scope.pcLocation = config['pc'];
        $scope.ps4Location = config['ps4'];
        $scope.xb1Location = config['xb1'];
    }
    $scope.populateBoxes($scope);

    $scope.showPcFileManager = function(){
        dialog.showOpenDialog({
            defaultPath: 'C:/',
            filters: [{
                name: 'Glyph Codes',
                extensions: ['txt', 'csv']
            }]
        },function(fileLocation){
            try {
                pcLocation = fileLocation.toString();
                console.log(pcLocation);
                document.getElementById('pc-input').value = pcLocation;
            } catch (e) {
                console.log('No file selected.');
            }

            // This subfunction needs to have a try catch block
        });
    }
    $scope.showPs4FileManager = function(){
        dialog.showOpenDialog({
            defaultPath: 'C:/',
            filters: [{
                name: 'Glyph Codes',
                extensions: ['txt', 'csv']
            }]
        },function(fileLocation){
            try{
                pcLocation = fileLocation.toString();
                console.log(ps4Location);
                document.getElementById('ps4-input').value = pcLocation;
            } catch (e) {
                console.log('No file selected.');
            }

        });
    }
    $scope.showXb1FileManager = function(){
        dialog.showOpenDialog({
            defaultPath: 'C:/',
            filters: [{
                name: 'Glyph Codes',
                extensions: ['txt', 'csv']
            }]
        },function(fileLocation){
            try{
                pcLocation = fileLocation.toString();
                console.log(xb1Location);
                document.getElementById('xb1-input').value = pcLocation;
            } catch (e) {
                console.log('No file selected.');
            }

        });
    }
    
    // For Twitter Integration
    $scope.twitterOauth = twitterOauth;
});

function saveLocations(){
    config['pc'] = pcLocation;
    config['ps4'] = ps4Location;
    config['xb1'] = xb1Location;
    var cipher = crypto.createCipher('aes-128-cbc', keyPass); // Issue here

    var cryptConfig = cipher.update(JSON.stringify(config), 'utf8', 'hex');
    cryptConfig += cipher.final('hex');
    var wd = jetpack.cwd();
    jetpack.write(`${__dirname}/bin/data.init`, cryptConfig);
}
function resetConfig(){
    pcLocation = '';
    ps4Location = '';
    xb1Location = '';
    saveLocations();
}
function LoadConfig(){
    try{
        console.log('Loading Save File!');
        var decipher = crypto.createDecipher('aes-128-cbc', keyPass);
        console.log('.');
        var loadedConfig = jetpack.read(`${__dirname}/bin/data.init`);
        console.log('.');
        var decrpt = decipher.update(loadedConfig, 'hex', 'utf8');
        console.log('.');
        decrpt += decipher.final('utf8');
        config = JSON.parse(decrpt);
        console.log('Save Loaded!');
    }catch(err){
        throw new err;
    }

}
// On the initial load, we will load the user's data
window.onload = function(){
    LoadConfig();
}
