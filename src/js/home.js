const util = require('util');
import copy from 'copy-to-clipboard';

var codezz = '';

app.controller('homeController', function($scope){
    // On home load
    $scope.$on('$routeChangeSuccess', function(event, current, prev){
        if(current.controller === 'homeController'){
            correctContSize();
            checkConnectBtns();
        }
    });
    // INIT FUNCTIONS
    document.onresize = correctContSize;
    postCodesCheck();
    checkLocations_mainButtons();

    $('.twitter-checkbox').each( (i, el) => {
        $(el).on('click', (event) => {
            checkCheckBoxes();
        });
    });
    checkCheckBoxes();
    ipcRenderer.send('verify-twit-auth');

    $scope.slider = document.getElementById("numCodes"); // Sets the slider to a value in $scope
    $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value

    // Update the current slider value (each time you drag the slider handle)
    $scope.sliderUpdate = function($event) {
        //output.innerHTML = this.value;
        $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value
    }

    $scope.pcCodeGrab = pcCodeGrab;
    $scope.ps4CodeGrab = ps4CodeGrab;
    $scope.xb1CodeGrab = xb1CodeGrab;

    $scope.twitterMultiplier = 0;

    // FOR TWITTER INTEGRATION
    $scope.pullCodes = async function(callback){
        let codes = '';
        if($('#twitPostPCCode:checked').length){
            pcCodeGrab( (pc) => {
                console.log('test: ' + pc);
                if(pc){
                    codes = codes + 'PC: ' + pc;
                }
                else
                    console.log('No File Location Chosen!', 'You did not choose ' +
                    'a PC Location! Please choose a location before trying to post codes on twitter!');
            });
        }
        if($('#twitPostPS4Code:checked').length){
            ps4CodeGrab( (ps4) => {
                if(ps4){
                    if(codes !== '') codes += '\n';
                    codes = codes + 'PS4: ' + ps4;
                }
                else
                    console.log('No File Location Chosen!', 'You did not choose ' +
                    'a PS4 ONE Location! Please choose a location before trying to post codes on twitter!');
            });
                    }
        if($('#twitPostXB1Code:checked').length){
            xb1CodeGrab( (xb1) => {
                if(xb1){
                    if(codes !== '') codes += '\n';
                    codes = codes + 'XB1: ' + xb1;
                }
                else
                    console.log('No File Location Chosen!', 'You did not choose a ' +
                    'XBOX ONE Location! Please choose a location before trying to post codes on twitter!');
            });
        }

        if(callback)
            await wait(1000);
            callback(codes);
    }

    $scope.postCodes = function(){
        $scope.pullCodes((codes) => {

            if(codes.length <= 280 && codes.length > 4){
                twitterPost(codes);
                console.log('codes posted successfully!');
                dialog.showMessageBox({
                    type: 'info',
                    buttons: {},
                    message: 'Your code(s) were posted to your Twitter account!'
                }, (res, checked) => {

                });
            }
            else{
                console.log('' + codes.length);
                dialog.showErrorBox('Giveaway Unsuccessful',
                'Something went wong during the process of posting your codes on Twitter. Try again.\nIf it continues to occur, reset the app or message TDefton')
            }
            copy('')
        });
    }

    function updateNumLoc(event){
        $scope.twitterMultiplier = $('.twitter-checkbox:checked').length;
        console.log($scope.twitterMultiplier);
    }
    $('.twitter-checkbox').each( (i, item) => {
        $(item).on('click', updateNumLoc);
    });
    $scope.updateNumLoc = updateNumLoc;

    ipcRenderer.on('twit-authed', postCodesCheck);





    // if one of the buttons are pressed
    $scope.discordConnect = function(){
        getDiscordConfig( data => {
            console.log('the token I recieved: ' + data.token);
            discordLogin(data.token, () => {
                dis_disableConnBtn();
                dis_enableDisconnBtn();
            });
        });
    }
    $scope.discordDisconnect = function(){
        discordLogout( () => {
            dis_disableDisconnBtn();
            dis_enableConnBtn();
        });

    }
    dis_client.on('ready', () =>{

    });

});

function pcCodeGrab(callback){
    console.log('pc: ' + coreSettings.pc);
    var codez = '';
    var newList = '';
    if(coreSettings.pc){
        fs.readFile(coreSettings.pc, (err, text) => {
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach( (ln) => {
                if(err){throw err;return;}
                if($('#numCodes').length){
                    if (counter <= $('#numCodes').val()){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $('#numCodes').val()){
                        newList += ln + "\n";
                    }
                }
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }

            });
            copy(codez.trim());
            jetpack.write(coreSettings.pc, newList.trim());
            counter = 0;
            notify('Code(s) Copied to clipboard!');
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose ' +
        'a PC Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

function ps4CodeGrab(callback){
    var codez = '';
    var newList = '';
    if(coreSettings.ps4){
        fs.readFile(coreSettings.ps4, function(err, text){
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach(function(ln){
                if(err){throw err;return;}
                if($('#numCodes').length){
                    if (counter <= $('#numCodes').val()){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $('#numCodes').val()){
                        newList += ln + "\n";
                    }
                }
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }

            });
            copy(codez.trim());
            jetpack.write(coreSettings.ps4, newList.trim());
            counter = 0;
            notify('Code(s) Copied to clipboard!');
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose a PS4 ONE Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

function xb1CodeGrab(callback){
    var codez = '';
    var newList = '';
    if(coreSettings.xb1){
        fs.readFile(coreSettings.xb1, function(err, text){
            if(err) throw err;
            var counter = 1;
            text.toString().split('\n').forEach(function(ln){
                if(err){throw err;return;}
                if($('#numCodes').length){
                    if (counter <= $('#numCodes').val()){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $('#numCodes').val()){
                        newList += ln + "\n";
                    }
                }
                else{
                    if (counter <= 1){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > 1){
                        newList += ln + "\n";
                    }
                }
            });
            copy(codez.trim());
            jetpack.write(coreSettings.xb1, newList.trim());
            counter = 0;
            notify('Code(s) Copied to clipboard!');
            if(callback){
                callback(codez.trim());
            }
        });
    }
    else{
        dialog.showErrorBox('No File Location Chosen!', 'You did not choose a ' +
        'XBOX ONE Location! Please choose a location before trying to grab codes!');
        return '';
    }
}

function postCodesCheck(event, authed){

    if(authed === true){
        console.log('twitter is authorized');
        $('#twitPostCodes').prop("disabled", false);
        // $('#twitPostCodes').toggleClass('btn-color-blue', true);
        $('#twitPostCodes').toggleClass('btn-disabled', false);
        checkLocations_checkboxes();
        checkCheckBoxes();
    }
    else{
        console.log('twitter is not authorized');
        $('#twitPostCodes').prop("disabled", true);
        // $('#twitPostCodes').toggleClass('btn-color-blue', false);
        $('#twitPostCodes').toggleClass('btn-disabled', true);

        $('#twitPostPCCode').prop('disabled', true);
        // $('#twitPostPCCode').toggleClass('checkbox-color', false);
        $('#twitPostPCCode').toggleClass('btn-disabled', true);

        $('#twitPostPS4Code').prop('disabled', true);
        // $('#twitPostPS4Code').toggleClass('checkbox-color', false);
        $('#twitPostPS4Code').toggleClass('btn-disabled', true);

        $('#twitPostXB1Code').prop('disabled', true);
        // $('#twitPostXB1Code').toggleClass('checkbox-color', false);
        $('#twitPostXB1Code').toggleClass('btn-disabled', true);
    }
}

function checkLocations_mainButtons(){
    ipcRenderer.send('get-core-settings');
    ipcRenderer.once('send-core-settings', (event, arg) => {
        let settings = JSON.parse(arg);
        console.log(settings);
        coreSettings = settings;
        console.log(coreSettings);
        if(coreSettings.pc !== ''){
            // pc codes location is available
            $('#grabPC').prop('disabled', false);
            //$('#grabPC').toggleClass('btn-color-gold', true);
            $('#grabPC').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabPC').prop('disabled', true);
            //$('#grabPC').toggleClass('btn-color-gold', false);
            $('#grabPC').toggleClass('btn-disabled', true);
        }
        if(coreSettings.ps4 !== ''){
            // ps4 codes location is available
            $('#grabPS4').prop('disabled', false);
            //$('#grabPS4').toggleClass('btn-color-gold', true);
            $('#grabPS4').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabPS4').prop('disabled', true);
            //$('#grabPS4').toggleClass('btn-color-gold', false);
            $('#grabPS4').toggleClass('btn-disabled', true);
        }
        if(coreSettings.xb1 !== ''){
            // xb1 codes location is available
            $('#grabXB1').prop('disabled', false);
            //$('#grabXB1').toggleClass('btn-color-gold', true);
            $('#grabXB1').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabXB1').prop('disabled', true);
            //$('#grabXB1').toggleClass('btn-color-gold', false);
            $('#grabXB1').toggleClass('btn-disabled', true);
        }
    });
}

function checkLocations_checkboxes(){
    ipcRenderer.send('get-core-settings');
    ipcRenderer.once('send-core-settings', (event, arg) => {
        console.log('test: ' + arg);
        let settings = JSON.parse(arg);
        coreSettings = settings;
        console.log(coreSettings);
        if(coreSettings.pc !== ''){
            // pc codes location is available
            $('#twitPostPCCode').prop('disabled', false);
            $('#twitPostPCCode').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable pc');
            $('#twitPostPCCode').prop('disabled', true);
            $('#twitPostPCCode').toggleClass('btn-disabled', true);
        }
        if(coreSettings.ps4 !== ''){
            // ps4 codes location is available
            $('#twitPostPS4Code').prop('disabled', false);
            $('#twitPostPS4Code').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable ps4');
            $('#twitPostPS4Code').prop('disabled', true);
            $('#twitPostPS4Code').toggleClass('btn-disabled', true);
        }
        if(coreSettings.xb1 !== ''){
            // xb1 codes location is available
            $('#twitPostXB1Code').prop('disabled', false);
            $('#twitPostXB1Code').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable xb1');
            $('#twitPostXB1Code').prop('disabled', true);
            $('#twitPostXB1Code').toggleClass('btn-disabled', true);
        }
    });
}

function checkCheckBoxes(){
    if($('#twitPostPCCode:checked').length === 0 && $('#twitPostPS4Code:checked').length === 0 && $('#twitPostXB1Code:checked').length === 0){
        // all of the checkboxes are unchecked
        console.log('all of the checkboxes are unchecked');
        $('#twitPostCodes').prop("disabled", true);
        $('#twitPostCodes').toggleClass('btn-disabled', true);
    }
    else if($('#twitPostPCCode:checked').length !== 0 || $('#twitPostPS4Code:checked').length !== 0 || $('#twitPostXB1Code:checked').length !== 0){
        // At least one checkbox is checked
        console.log('At least one checkbox is checked');
        $('#twitPostCodes').prop("disabled", false);
        $('#twitPostCodes').toggleClass('btn-disabled', false);
    }
}

$(document).ready( () => {
        console.log('DOM ready!');
        
        // Checking if I should connect to discord
        getDiscordConfig((dat) => {
            if(dat.options.auto_conn){
                // if there is a token to login with, then use it
                if(dat.token){
                    discordLogin(dat.token, (err) => {
                        if(err){
                            console.warn('I tried to connect to discord, but there was no token.');
                        }
                    });
                }
            }
        });
    });
