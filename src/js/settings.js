const jetpack = require('fs-jetpack');

var pcLocation = '';
var ps4Location = '';
var xb1Location = '';
const keyPass = 'WarframeFanChannels';
coreSettings = {
    "options": {
        "run_on_start": false
    }
};
app.controller('settingsController', function($scope){
    getCoreSettings();
    $scope.$on('$routeChangeStart', function(event, current, prev){
        if(current.controller === 'settingsController'){
            console.log('LETS GO!');
            LoadConfig(() => {

            });
        }
    });
    configCheck();

    $scope.showFileManager = function(platform){
        openDialogBox('Glyph Codes', ['txt', 'csv', 'tsv'], (fileLocation) => {
            if(platform === 'pc'){
                pcLocation = fileLocation.toString();
                dialog.showMessageBox({
                    type: "question",
                    buttons: ["Yes", "Cancel"],
                    title: "Are you sure?",
                    message: `I am about to add this file "${pcLocation}" to the pc codes list. Are you sure this is the correct file?`,

                }, (res) => {
                    console.log(res);
                    if(res === 0){
                        ipcRenderer.send('append-codes', {
                            "platform": "pc",
                            "location": pcLocation
                        });
                    }
                });
            }
            else if(platform === 'ps4'){
                ps4Location = fileLocation.toString();
                dialog.showMessageBox({
                    type: "question",
                    buttons: ["Yes", "Cancel"],
                    title: "Are you sure?",
                    message: `I am about to add this file "${ps4Location}" to the PS4 codes list. Are you sure this is the correct file?`,

                }, (res) => {
                    console.log(res);
                    if(res === 0){
                        ipcRenderer.send('append-codes', {
                            "platform": "ps4",
                            "location": ps4Location
                        });
                    }
                });
            }
            else if(platform === 'xb1'){
                xb1Location = fileLocation.toString();
                dialog.showMessageBox({
                    type: "question",
                    buttons: ["Yes", "Cancel"],
                    title: "Are you sure?",
                    message: `I am about to add this file "${xb1Location}" to the Xbox One codes list. Are you sure this is the correct file?`,

                }, (res) => {
                    if(res === 0){
                        ipcRenderer.send('append-codes', {
                            "platform": "xb1",
                            "location": xb1Location
                        });
                    }
                });
            }
            ipcRenderer.once('append-codes-success', (event, arg) =>{
                checkNumCodes();
                notify('Code list updated!')
            });
        });
    }
    $scope.clearCodes = clearCodes;

    $('.core-settings-change').change(function(){
        coreSettings.options.run_on_start = $('#run-on-start').prop('checked');
        console.log(coreSettings.options.run_on_start);
    });
    correctContSize();

    $scope.showVersion = function(){
        ipcRenderer.send('show-app-version');
    }

});

function getCoreSettings(){
    ipcRenderer.send('get-core-settings');
    ipcRenderer.once('send-core-settings', (event, arg) => {
        let settings;
        try{
            settings = JSON.parse(arg);
        }
        catch(err){
            console.log('Resetting Data...');
            ipcRenderer.send('reset-core-settings');
            getCoreSettings();
        }
        checkNumCodes();

        $('#run-on-start').prop('checked', settings.options.run_on_start);
    });

}
function checkNumCodes(){
    ipcRenderer.send('get-num-codes');
    ipcRenderer.once('num-codes', (event, numCodes) => {
        $('#pc-numcodes').text(numCodes.pc);
        $('#ps4-numcodes').text(numCodes.ps4);
        $('#xb1-numcodes').text(numCodes.xb1);
    });
}


/**
 * This function opens a dialog box to browse the system and find a file.
 * @param  {String}   name     What to name the window
 * @param  {Function} callback The function to call when the action is completed
 * @param  {Array}    fileTypes an array of the filetypes you want to search for (send an empty array for an file type)
 * @return {None}
 */
function openDialogBox(windowName, fileTypes, callback){
    dialog.showOpenDialog({
        defaultPath: 'C:/',
        filters: [{
            name: windowName,
            extensions: fileTypes
        }]
    },function(fileLocation){
        console.log('This is the location: ' + fileLocation);
        try{
            callback(fileLocation);
        } catch (e) {
            console.log('No file selected.');
        }

    });
}

function saveLocations(){
    ipcRenderer.send('get-core-settings');
    ipcRenderer.once('send-core-settings', (event, arg) => {
        let settings = JSON.parse(arg);

        settings.options.run_on_start = coreSettings.options.run_on_start;
        console.log('This is the new config of the core settings:\n' + settings);
        ipcRenderer.send('set-core-settings', {
            value: JSON.stringify(settings)
        });

        // For options
        ipcRenderer.send('auto-launch', {
            enabled: settings.options.run_on_start
        });
    });
    let locations = [];
    if(pcLocation != undefined && pcLocation.length > 2){
        console.log('saving pc');
        locations[0] = pcLocation;
    }
    if(ps4Location != undefined && ps4Location.length > 2){
        console.log('saving ps4: ' + ps4Location);
        locations[1] = ps4Location;
    }
    if(xb1Location != undefined && xb1Location.length > 2){
        console.log('saving xb1');
        locations[2] = xb1Location;
    }
}

function clearCodes(platform) {
    ipcRenderer.send('clear-codes', {"platform": platform});
    ipcRenderer.once('codes-clear-success', (event, status) => {
        window.location = '#/!';
        notify(platform + ' codes cleared!');
    });
}

function resetConfig(){
    ipcRenderer.send('reset-core-settings');
    pcLocation = '';
    ps4Location = '';
    xb1Location = '';

    // saveLocations(); //#################################################

    //resetTwitchConfig();
    ipcRenderer.send('clearTwitterAuth');    // Reset Twitter
    resetDiscordConfig();

    resetTwitchConfig();

    ipcRenderer.send('clear-gsheets-token');

    window.location = '#/!';
    notify('Data Reset');
}

function LoadConfig(callback){
    console.log('Loading Save File!');

    ipcRenderer.send('get-core-settings');
    ipcRenderer.once('send-core-settings', (event, arg) => {
        coreSettings = JSON.parse(arg);
        pcLocation = coreSettings.pc;
        ps4Location = coreSettings.ps4;
        xb1Location = coreSettings.xb1;
        console.log('Save Loaded!');
        if(callback){
            callback();
        }
    });



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
            ipcRenderer.send('clearTwitterAuth');
        }
        else{
            ipcRenderer.send('get-twi-keys');
        }

    });
}
// On the initial load, we will load the user's data
$(document).ready(function(){



    //configCheck();

});
