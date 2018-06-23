const fs = require('fs');
const util = require('util');
import copy from 'copy-to-clipboard';

app.controller('homeController', function($scope){
    $scope.slider = document.getElementById("numCodes"); // Sets th slider to a value in $scope
    $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value

    // Update the current slider value (each time you drag the slider handle)
    $scope.sliderUpdate = function($event) {
        //output.innerHTML = this.value;
        $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value
    }
    document.onresize = correctContSize;

    $scope.pcCodeGrab = function(){
        try{
            var codez = '';
            var newList = '';
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

        } catch(err){
            const dialogOpts = {
            		type: 'info',
            		message: 'Something went wrong...',
            		detail: 'Error: ' + err
            	}
            dialog.showMessageBox(dialogOpts);
        }
    }
    $scope.ps4CodeGrab = function(){
        try{

            var codez = '';
            var newList = '';
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

        } catch(err){
            const dialogOpts = {
            		type: 'info',
            		message: 'Something went wrong...',
            		detail: 'Error: ' + err
            	}
            dialog.showMessageBox(dialogOpts);
        }
    }
    $scope.xb1CodeGrab = function(){
        try{

            var codez = '';
            var newList = '';
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

        } catch(err){
            const dialogOpts = {
            		type: 'info',
            		message: 'Something went wrong...',
            		detail: 'Error: ' + err
            	}
            dialog.showMessageBox(dialogOpts);
        }
    }

    // FOR TWITTER INTEGRATION
    $scope.twitterPost = twitterPost;
});
