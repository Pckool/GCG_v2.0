//
//
//
import {dialog} from 'electron';

(function(){
    // PREREQUISITES
    var fs = require('fs');
    // var jsdom = require("jsdom");
    // const { JSDOM } = jsdom;
    // const { window } = new JSDOM();
    // const { document } = (new JSDOM('')).window;
    // global.document = document;
    //
    // var $ = require('jquery')(window);

    // function arrayContains(needle, arrhaystack){
    //     return (arrhaystack.indexOf(needle) > -1);
    // }

    var GCGrabber = {};

    // MODULE PROPERTIES

    GCGrabber.codeGrab = function (platform, numCodes, storedCodesLoc, callback){
        // console.log('pc: ' + coreSettings.pc);
        var codez = [];
        var newList = '';
        let dataOBJ;
        if(platform === "pc"){
            // modifyt to use Array.split() evenually
            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);
                for (var i = 0; i < numCodes; i++) {
                    try{
                        codez[i] = codez + dataOBJ.pc.shift() + "\n";
                    }catch(e){
                        dialog.showErrorBox('Ran out of Codes :(', 'Looks like you ran out of codes or something :( \n send this to TDefton: ' + e)
                        return;
                    }
                }
                fs.writeFileSync(storedCodesLoc, JSON.stringify(dataOBJ, null, 4));
                if(callback){
                    callback(codez);
                }
            });
        }
        else if(platform === "ps4"){
            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);
                for (var i = 0; i < numCodes; i++) {
                    try{
                        codez[i] = codez + dataOBJ.ps4.shift() + "\n";
                    }catch(e){
                        dialog.showErrorBox('Ran out of Codes :(', 'Looks like you ran out of codes or something :( \n send this to TDefton: ' + e)
                    }
                }
                fs.writeFileSync(storedCodesLoc, JSON.stringify(dataOBJ, null, 4));
                if(callback){
                    callback(codez);
                }
            });

        }
        else if(platform === "xb1"){
            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);
                for (var i = 0; i < numCodes; i++) {
                    try{
                        codez[i] = codez + dataOBJ.xb1.shift() + "\n";
                    }catch(e){
                        dialog.showErrorBox('Ran out of Codes :(', 'Looks like you ran out of codes or something :( \n send this to TDefton: ' + e)
                    }
                }
                fs.writeFileSync(storedCodesLoc, JSON.stringify(dataOBJ, null, 4));
                if(callback){
                    callback(codez);
                }
            });

        }
        else{
            dialog.showErrorBox('No Platform Chosen!', 'You did not choose ' +
            'a Platform! Please choose one before trying to grab codes!');
            return '';
        }
    }

    GCGrabber.appendCodes = function(platform, codez, storedCodesLoc, callback){
        platform = platform.toLowerCase();

        if(platform === 'pc' && codez.length > 0){
            let dataOBJ;

            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);

                let concatCodes = dataOBJ.pc.concat(codez);
                // used to ensure there are no duplicates
                let uniqueCodes = [];
                concatCodes.forEach(function(el, i){
                    if( ! uniqueCodes.includes(el) ) uniqueCodes.push(el);
                });
                dataOBJ.pc = uniqueCodes;

                // Write the new data
                fs.writeFile(storedCodesLoc, JSON.stringify(dataOBJ, null, 4), (err) => {
                    if(err) throw err;
                    if(callback) callback();
                });
            });

        }
        else if(platform === 'ps4' && codez.length > 0){
            let dataOBJ;

            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);

                let concatCodes = dataOBJ.ps4.concat(codez);
                // used to ensure there are no duplicates
                let uniqueCodes = [];
                concatCodes.forEach(function(el, i){
                    if( ! uniqueCodes.includes(el) ) uniqueCodes.push(el);
                });
                dataOBJ.ps4 = uniqueCodes;

                // Write the new data
                fs.writeFile(storedCodesLoc, JSON.stringify(dataOBJ, null, 4), (err) => {
                    if(err) throw err;
                    if(callback) callback();
                });
            });
        }
        else if(platform === 'xb1' && codez.length > 0){
            let dataOBJ;

            fs.readFile(storedCodesLoc, (err, data) => {
                if(err) throw err;
                dataOBJ = JSON.parse(data);

                let concatCodes = dataOBJ.xb1.concat(codez);
                // used to ensure there are no duplicates
                let uniqueCodes = [];
                concatCodes.forEach(function(el, i){
                    if( ! uniqueCodes.includes(el) ) uniqueCodes.push(el);
                });
                dataOBJ.xb1 = uniqueCodes;

                // Write the new data
                fs.writeFile(storedCodesLoc, JSON.stringify(dataOBJ, null, 4), (err) => {
                    if(err) throw err;
                    if(callback) callback();
                });
            });
        }
        else if(callback){
            console.log('There was no platform, or the codes array was empty. Returning.');
            callback();
        }
    }

    GCGrabber.clearCodes = function (platform, storedCodesLoc, callback) {
        let dataOBJ;
        fs.readFile(storedCodesLoc, (err, data) => {
            if(err) throw err;

            dataOBJ = JSON.parse(data);
            if(platform === 'pc')
                dataOBJ.pc = [];
            if(platform === 'ps4')
                dataOBJ.ps4 = [];
            if(platform === 'xb1')
                dataOBJ.xb1 = [];

            // Write the new data
            dialog.showMessageBox({
                type: "warning",
                buttons: [
                    "Yes",
                    "No"
                ],
                message: "Are you sure you want to clear your codes?"
            }, (res) => {
                if(res === 0) {
                    fs.writeFile(storedCodesLoc, JSON.stringify(dataOBJ, null, 4), (err) => {
                        if(err) throw err;
                        if(callback) callback('success');
                    });
                }
                if(res === 1) {
                    return;
                }
            });

        });
    }

    GCGrabber.getCodeNums = function (storedCodesLoc, callback) {
        let dataOBJ;
        let codeNums = {
            "pc": 0,
            "ps4": 0,
            "xb1": 0
        }
        fs.readFile(storedCodesLoc, (err, data) => {
            if(err) {
                let codesJSON = {
                    "pc":  [],
                    "ps4": [],
                    "xb1": []
                }
                fs.writeFile(storedCodesLoc, JSON.stringify(codesJSON, null, 4), (err) => {
                    if(err){console.log('Couldn\'t create the codes storage.');}
                });
            }

            dataOBJ = JSON.parse(data);

            codeNums.pc = dataOBJ.pc.length;
            codeNums.ps4 = dataOBJ.ps4.length;
            codeNums.xb1 = dataOBJ.xb1.length;

            callback(codeNums);
        });
    }


    if(typeof module === 'object' && module.exports){
        module.exports = GCGrabber;
    }
})();
