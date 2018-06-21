const fs = require('fs');
const util = require('util');
import copy from 'copy-to-clipboard';

app.controller('homeController', function($scope){
    $scope.slider = document.getElementById("numCodes");
    $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value

    // Update the current slider value (each time you drag the slider handle)
    $scope.sliderUpdate = function($event) {
        //output.innerHTML = this.value;
        $scope.sliderValue = parseInt($scope.slider.value); // Display the slider value
    }

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
            console.log('Something went wrong: ' + err);
        }
    }
});
