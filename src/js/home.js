const util = require('util');
const copy = require('clipboard-copy');

var codezz = '';

app.controller('homeController', function($scope){
    // On home load
    $scope.$on('$routeChangeSuccess', function(event, current, prev){
        if(current.controller === 'homeController'){
            checkConnectBtns();
            ipcRenderer.send('connect-to-twitter');
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
    $scope.switchCodeGrab = switchCodeGrab;

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
                    'Xbox One Location! Please choose a location before trying to post codes on twitter!');
            });
        }

        if($('#twitPostSwitchCode:checked').length){
            switchCodeGrab(newCodes => {
                if(newCodes){
                    if(codes !== '') codes += '\n';
                    codes = codes + 'Switch: ' + newCodes;
                }
                else
                    console.log('No File Location Chosen!', 'You did not choose a ' +
                    'Switch Location! Please choose a location before trying to post codes on twitter!');
            });
        }

        if(callback){
            setTimeout(function () {
                console.log('HERE: ' + codes);
                callback(codes);
            }, 2000);
            // await wait(2000);

        }
    }

    $scope.postCodes = function(){
        $scope.pullCodes( codes => {

            if(codes.length <= 280 && codes.length > 4){
                twitterPost(codes);

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

    $scope.openDiscordControls = function(){
        // $('#discord-controls').toggleClass('show');
        // $('#discord-controls').addClass('collapsing');
    }
    $scope.openTwitterControls = function(){
        // $('#twitter-controls').toggleClass('show');
    }
    dis_client.on('ready', () =>{

    });



});

// Make this work properly with discord giveaways as well.

function pcCodeGrab(callback){
    ipcRenderer.send('grab-code',{
        "platform": "pc",
        "num_codes": $('#numCodes').val()
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(codes.platform === "pc"){
            console.log(codes);
            if(callback){
                callback(codes.codes);
            }
            else{
                copy(codes.codes);
                notify('PC codes copied to clipboard');
            }
        }
    });
}

function ps4CodeGrab(callback){
    ipcRenderer.send('grab-code',{
        "platform": "ps4",
        "num_codes": $('#numCodes').val()
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(codes.platform === "ps4"){
            if(callback){
                callback(codes.codes);
            }
            else{
                copy(codes.codes);
                notify('PS4 codes copied to clipboard');
            }
        }
    });
}

function xb1CodeGrab(callback){
    ipcRenderer.send('grab-code',{
        "platform": 'xb1',
        "num_codes": $('#numCodes').val()
    });
    ipcRenderer.once('grabbed-codes', (ewvent, codes) => {
        if(codes.platform === "xb1"){
            if(callback){
                callback(codes.codes);
            }
            else{
                copy(codes.codes);
                notify('Xbox One codes copied to clipboard');
            }
        }
    });
}

function switchCodeGrab(callback){
    ipcRenderer.send('grab-code',{
        "platform": "switch",
        "num_codes": $('#numCodes').val()
    });
    ipcRenderer.once('grabbed-codes', (event, codes) => {
        if(codes.platform === "switch"){
            if(callback){
                callback(codes.codes);
            }
            else{
                copy(codes.codes);
                notify('Switch codes copied to clipboard');
            }
        }
    });
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
        $('#twitPostCodes').toggleClass('btn-disabled', true);

        $('#twitPostPCCode').prop('disabled', true);
        $('#twitPostPCCode').toggleClass('btn-disabled', true);

        $('#twitPostPS4Code').prop('disabled', true);
        $('#twitPostPS4Code').toggleClass('btn-disabled', true);

        $('#twitPostXB1Code').prop('disabled', true);
        $('#twitPostXB1Code').toggleClass('btn-disabled', true);

        $('#twitPostSwitchCode').prop('disabled', true);
        $('#twitPostSwitchCode').toggleClass('btn-disabled', true);
    }
}

function checkLocations_mainButtons(){
    ipcRenderer.send('get-num-codes');

    ipcRenderer.once('num-codes', (event, numCodes) => {
        if(numCodes.pc !== 0){
            // pc codes location is available
            $('#grabPC').prop('disabled', false);
            $('#grabPC').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabPC').prop('disabled', true);
            $('#grabPC').toggleClass('btn-disabled', true);
        }
        if(numCodes.ps4 !== 0){
            // ps4 codes location is available
            $('#grabPS4').prop('disabled', false);
            $('#grabPS4').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabPS4').prop('disabled', true);
            $('#grabPS4').toggleClass('btn-disabled', true);
        }
        if(numCodes.xb1 !== 0){
            // xb1 codes location is available
            $('#grabXB1').prop('disabled', false);
            $('#grabXB1').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabXB1').prop('disabled', true);
            $('#grabXB1').toggleClass('btn-disabled', true);
        }
        if(numCodes.switch !== 0){
            // switch codes location is available
            $('#grabSwitch').prop('disabled', false);
            $('#grabSwitch').toggleClass('btn-disabled', false);
        }
        else{
            $('#grabSwitch').prop('disabled', true);
            $('#grabSwitch').toggleClass('btn-disabled', true);
        }

    });
}

function checkLocations_checkboxes(){
    ipcRenderer.send('get-num-codes');

    ipcRenderer.once('num-codes', (event, numCodes) => {

        if(numCodes.pc !== ''){
            // pc codes location is available
            $('#twitPostPCCode').prop('disabled', false);
            $('#twitPostPCCode').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable pc');
            $('#twitPostPCCode').prop('disabled', true);
            $('#twitPostPCCode').toggleClass('btn-disabled', true);
        }
        if(numCodes.ps4 !== ''){
            // ps4 codes location is available
            $('#twitPostPS4Code').prop('disabled', false);
            $('#twitPostPS4Code').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable ps4');
            $('#twitPostPS4Code').prop('disabled', true);
            $('#twitPostPS4Code').toggleClass('btn-disabled', true);
        }
        if(numCodes.xb1 !== ''){
            // xb1 codes location is available
            $('#twitPostXB1Code').prop('disabled', false);
            $('#twitPostXB1Code').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable xb1');
            $('#twitPostXB1Code').prop('disabled', true);
            $('#twitPostXB1Code').toggleClass('btn-disabled', true);
        }
        if(numCodes.switch !== ''){
            // xb1 codes location is available
            $('#twitPostSwitchCode').prop('disabled', false);
            $('#twitPostSwitchCode').toggleClass('btn-disabled', false);
        }
        else{
            console.log('trying to disable xb1');
            $('#twitPostSwitchCode').prop('disabled', true);
            $('#twitPostSwitchCode').toggleClass('btn-disabled', true);
        }
    });
}

function checkCheckBoxes(){
    if($('#twitPostPCCode:checked').length === 0 && $('#twitPostPS4Code:checked').length === 0 && $('#twitPostXB1Code:checked').length === 0 && $('#twitPostSwitchCode:checked').length === 0){
        // all of the checkboxes are unchecked
        console.log('all of the checkboxes are unchecked');
        $('#twitPostCodes').prop("disabled", true);
        $('#twitPostCodes').toggleClass('btn-disabled', true);
    }
    else if($('#twitPostPCCode:checked').length > 0 || $('#twitPostPS4Code:checked').length > 0 || $('#twitPostXB1Code:checked').length > 0 || $('#twitPostSwitchCode:checked').length > 0){
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
