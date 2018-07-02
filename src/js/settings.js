const crypto = require('crypto');
const jetpack = require('fs-jetpack');

var pcLocation = '';
var ps4Location = '';
var xb1Location = '';
const keyPass = 'WarframeFanChannels';
var config = {
    pc: '',
    ps4: '',
    xb1: ''
}
app.controller('settingsController', function($scope){
    correctContSize();
    document.onresize = correctContSize;
    configCheck();

    $scope.populateBoxes = function($scope){
        $scope.pcLocation = config.pc;
        $scope.ps4Location = config.ps4;
        $scope.xb1Location = config.xb1;
    }
    $scope.populateBoxes($scope);

    $scope.showPcFileManager = function(){
        dialog.showOpenDialog({
            defaultPath: 'C:/',
            filters: [{
                name: 'Glyph Codes',
                extensions: ['txt', 'csv', 'tsv']
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
                extensions: ['txt', 'csv', 'tsv']
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
                extensions: ['txt', 'csv', 'tsv']
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
});

function saveLocations(){
    config.pc = pcLocation;
    config.ps4 = ps4Location;
    config.xb1 = xb1Location;
    let cfg = JSON.stringify(config);
    ipcRenderer.send( 'encrypt-data', {value: cfg} );
    ipcRenderer.on('encrypted-data', (event, arg) =>{
        jetpack.write(`${__dirname}/bin/loc.dat`, arg );
        console.log('Location(s) Saved!');
    });

}
function resetConfig(){
    pcLocation = '';
    ps4Location = '';
    xb1Location = '';
    saveLocations();
    ipcRenderer.send('clearTwitterAuth');

    ipcRenderer.send('verify-twit-auth');
}
function LoadConfig(){
    try{
        console.log('Loading Save File!');
        fs.readFile(`${__dirname}/bin/loc.dat`, (err, data) => {
            ipcRenderer.send('decrypt-data', {value: data});
            ipcRenderer.on('decrypted-data', (event, arg) => {
                config = JSON.parse(arg);
                console.log('Save Loaded!');
            });
        });

    }catch(err){
        throw new err;
    }
}
function configCheck(){
    fs.readFile(`${__dirname}/bin/loc.dat`, (err, data) => {
        if(err){
            saveLocations();
        }
        else{
            LoadConfig();
        }
    });
    fs.readFile(`${__dirname}/bin/tw.dat`, (err, data) => {
        if(err){
            ipcenderer.send('clearTwitterAuth');
        }
        else{
            ipcRenderer.send('get-twi-keys');
        }

    });
}
// On the initial load, we will load the user's data
window.onload = function(){
    //configCheck();

}
