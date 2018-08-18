const crypto = require('crypto');
const jetpack = require('fs-jetpack');

var pcLocation = '';
var ps4Location = '';
var xb1Location = '';
const keyPass = 'WarframeFanChannels';
config = {
    pc: '',
    ps4: '',
    xb1: ''
};
app.controller('settingsController', function($scope){
    document.onresize = correctContSize;
    configCheck();

    $scope.populateBoxes = function($scope){
        $('#pc-input').text(config.pc);
        $('#ps4-input').text(config.ps4);
        $('#xb1-input').text(config.xb1);
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
                $('#pc-Location').text(pcLocation);
            } catch (e) {
                console.log('No file selected.');
            }
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
                ps4Location = fileLocation.toString();
                console.log(ps4Location);
                $('#ps4-Location').text(ps4Location);
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
                xb1Location = fileLocation.toString();
                console.log(xb1Location);
                $('#xb1-Location').text(xb1Location);
            } catch (e) {
                console.log('No file selected.');
            }

        });
    }
    correctContSize();

});

function saveLocations(){
    config.pc = pcLocation;
    config.ps4 = ps4Location;
    config.xb1 = xb1Location;
    let cfg = JSON.stringify(config);
    ipcRenderer.send('set-config', cfg); // Setting the config variable for use right now
    ipcRenderer.send( 'encrypt-data', {value: cfg} ); // setting the config file for later use
    ipcRenderer.on('encrypted-data', (event, arg) =>{
        jetpack.write(`${__dirname}/bin/loc.dat`, arg );
        console.log('Location(s) Saved!');
    });
    // notify('Saved Data');
}
function resetConfig(){
    pcLocation = '';
    ps4Location = '';
    xb1Location = '';
    saveLocations(); //#################################################
    ipcRenderer.send('clearTwitterAuth');
    resetDiscordConfig();

    ipcRenderer.send('verify-twit-auth');
    notify('Data Reset');
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
            saveLocations(); //#################################################
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
$(document).ready(function(){
    fs.readFile(`${__dirname}/bin/loc.dat`, (err, data) => {
        if(err) throw err;
        ipcRenderer.send('decrypt-data', {value:data});
        ipcRenderer.on('decrypted-data', (event, arg) => {
            let dat = JSON.parse(arg);
            pcLocation = dat.pc;
            ps4Location = dat.ps4;
            xb1Location = dat.xb1;

            saveLocations(); //#################################################
            ipcRenderer.send('set-config', arg);
        });
    });

    //configCheck();

});
