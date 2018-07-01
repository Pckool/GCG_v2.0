const util = require('util');
import copy from 'copy-to-clipboard';

app.controller('homeController', function($scope){
    correctContSize();
    $scope.slider = document.getElementById("numCodes"); // Sets th slider to a value in $scope
    $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value

    // Update the current slider value (each time you drag the slider handle)
    $scope.sliderUpdate = function($event) {
        //output.innerHTML = this.value;
        $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value
    }
    document.onresize = correctContSize;

    $scope.pcCodeGrab = pcCodeGrab;
    $scope.ps4CodeGrab = ps4CodeGrab;
    $scope.xb1CodeGrab = xb1CodeGrab;

    $scope.twitterMultiplier = 0;
    // FOR TWITTER INTEGRATION
    $scope.postCodes = function(){
        let codes = '';
        if($('#twitPostPCCode:checked').length){
            let pc = pcCodeGrab();
            if(pc){
                codes = codes + 'PC: ' + pc;
            }
            else{
                console.log('No File Location Chosen!', 'You did not choose a PC Location! Please choose a location before trying to post codes on twitter!');
            }
        }
        if($('#twitPostPS4Code:checked').length){
            let ps4 = ps4CodeGrab();
            if(ps4){
                if(codes !== '') codes += '\n';
                codes = codes + 'PS4: ' + ps4;
            }
            else{
                console.log('No File Location Chosen!', 'You did not choose a PS4 ONE Location! Please choose a location before trying to post codes on twitter!');
            }
        }
        if($('#twitPostXB1Code:checked').length){
            let xb1 = xb1CodeGrab();
            if(xb1){
                if(codes !== '') codes += '\n';
                codes = codes + 'XB1: ' + xb1;
            }
            else{
                console.log('No File Location Chosen!', 'You did not choose a XBOX ONE Location! Please choose a location before trying to post codes on twitter!');
            }
        }

        if(codes.length <= 280 && codes.length > 4){
            twitterPost(codes);
            console.log('codes posted successfully!');
        }
        else{
            //dialog
        }
        copy('')
    }
    function updateNumLoc(event){
        $scope.twitterMultiplier = $('.twitter-checkbox:checked').length;
        console.log($scope.twitterMultiplier);
    }
    $('.twitter-checkbox').each( (i, item) => {
        $(item).on('click', updateNumLoc);
    });
    $scope.updateNumLoc = updateNumLoc;

    ipcRenderer.on('twit-authed', function(event, authed){

        if(authed === true){
            $('#twitPostCodes').prop("disabled", false);
            $('#twitPostCodes').toggleClass('btn-color-blue', true);
            $('#twitPostCodes').toggleClass('btn-disabled', false);

            $('#twitPostPCCode').prop('disabled', false);
            // $('#twitPostPCCode').toggleClass('btn-disabled', false);
            $('#twitPostPS4Code').prop('disabled', false);
            // $('#twitPostPS4Code').toggleClass('btn-disabled', false);
            $('#twitPostXB1Code').prop('disabled', false);
            // $('#twitPostXB1Code').toggleClass('btn-disabled', false);
        }
        else{
            $('#twitPostCodes').prop("disabled", true);
            $('#twitPostCodes').toggleClass('btn-color-blue', false);
            $('#twitPostCodes').toggleClass('btn-disabled', true);

            $('#twitPostPCCode').prop('disabled', true);
            // $('#twitPostPCCode').toggleClass('btn-disabled', true);
            $('#twitPostPS4Code').prop('disabled', true);
            // $('#twitPostPS4Code').toggleClass('btn-disabled', true);
            $('#twitPostXB1Code').prop('disabled', true);
            // $('#twitPostXB1Code').toggleClass('btn-disabled', true);
        }
    });


});

function pcCodeGrab(){
    try{
        var codez = '';
        var newList = '';
        if(config['pc']){
            fs.readFile(config['pc'], function(err, text){
                console.log(text);
                var counter = 1;
                text.toString().split('\n').forEach(function(ln){
                    if(err){
                        throw err;
                    }
                    else if (counter <= $scope.sliderValue){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $scope.sliderValue){
                        newList += ln + "\n";
                    }
                });
                console.log(codez);
                copy(codez);
                jetpack.write(config['pc'], newList.trim());
                counter = 0;

            });
            return codez;
        }
        else{
            dialog.showErrorBox('No File Location Chosen!', 'You did not choose a PC Location! Please choose a location before trying to grab codes!');
            return '';
        }

    } catch(err){
        const dialogOpts = {
                type: 'info',
                message: 'Something went wrong...',
                detail: 'Error: ' + err
            }
        dialog.showMessageBox(dialogOpts);
    }
}

function ps4CodeGrab(){
    try{

        var codez = '';
        var newList = '';
        if(config['ps4']){
            fs.readFile(config['ps4'], function(err, text){
                console.log(text);
                var counter = 1;
                text.toString().split('\n').forEach(function(ln){
                    if(err){
                        throw err;
                    }
                    else if (counter <= $scope.sliderValue){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $scope.sliderValue){
                        newList += ln + "\n";
                    }
                });
                console.log(codez);
                copy(codez);
                jetpack.write(config['ps4'], newList.trim());
                counter = 0;

            });
            return codez;
        }
        else{
            dialog.showErrorBox('No File Location Chosen!', 'You did not choose a PS4 ONE Location! Please choose a location before trying to grab codes!');
            return '';
        }

    } catch(err){
        const dialogOpts = {
                type: 'info',
                message: 'Something went wrong...',
                detail: 'Error: ' + err
            }
        dialog.showMessageBox(dialogOpts);
    }
}

function xb1CodeGrab(){
    try{

        var codez = '';
        var newList = '';
        if(config['xb1']){
            fs.readFile(config['xb1'], function(err, text){
                console.log(text);
                var counter = 1;
                text.toString().split('\n').forEach(function(ln){
                    if(err){
                        throw err;
                    }
                    else if (counter <= $scope.sliderValue){
                        console.log('Code ' + counter + ': ' + ln)
                        codez += ln;
                        counter++;
                    }
                    else if (counter > $scope.sliderValue){
                        newList += ln + "\n";
                    }
                });
                console.log(codez);
                copy(codez);
                jetpack.write(config['xb1'], newList.trim());
                counter = 0;
            });
            return codez;
        }
        else{
            dialog.showErrorBox('No File Location Chosen!', 'You did not choose a XBOX ONE Location! Please choose a location before trying to grab codes!');
            return '';
        }
    } catch(err){
        const dialogOpts = {
                type: 'info',
                message: 'Something went wrong...',
                detail: 'Error: ' + err
            }
        dialog.showMessageBox(dialogOpts);
    }
}

$('#twitPostCodes').ready( () => {
        console.log('DOM ready!');
        ipcRenderer.send('verify-twit-auth');
    });
