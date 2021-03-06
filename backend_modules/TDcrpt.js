// gcg's encryption module
import {dialog} from 'electron';
(function(){
    const keyPass = 'WarframeFanChannels';
    var fs = require('fs');
    const cryptoJS = require('crypto-js');             // For cyphers


    var TDcrpt = {};

    TDcrpt.encryptData = function (event, arg){
        try{
            var encrpt = cryptoJS.AES.encrypt(arg.value, keyPass);
            if(event !== undefined)
                event.sender.send('encrypted-data', encrpt.toString());
            return encrpt;
        }
        catch(err){
            dialog.showErrorBox('Encryption Error', 'Something wasn\'t encrypted properly. Please report this to TDefton!\nError: ' + err.stack);
        }
    }

    TDcrpt.decryptData =function (event, arg){
        try{
            var bytes = cryptoJS.AES.decrypt(arg.value.toString(), keyPass);
            var decrpt = bytes.toString(cryptoJS.enc.Utf8);
            if(event !== undefined)
                event.sender.send('decrypted-data', decrpt);
            return decrpt;
        }
        catch(err){
            dialog.showErrorBox('Decryption Error', 'Something wasn\'t decrypted properly. Please report this to TDefton!\n\n' + err.stack);
        }
    }

    TDcrpt.getEncryptedData = function (location, callback){
        fs.readFile(location, (err, dat) => {
            if (err) callback(err);
            else{
                let decryptedDat = TDcrpt.decryptData(undefined, {value: dat});
                if(callback) callback(undefined, decryptedDat);
            }
        });
    }
    TDcrpt.setEncryptedData = function (location, data, callback){
        let encryptedDat = TDcrpt.encryptData(undefined, {value: data});
        fs.writeFile(location, encryptedDat, (err) => {
            if (err) return callback(err);
            else{
                if(callback) callback();
            }
        });
    }
    TDcrpt.getEncryptedDataSync = function (location){
        try{
            let dat = fs.readFileSync(location);
            let decryptedDat = TDcrpt.decryptData(undefined, {value: dat});
            return decryptedDat;
        } catch(err){
            throw err;
        }

    }
    TDcrpt.setEncryptedDataSync = function (location, data){
        try{
            let encryptedDat = TDcrpt.encryptData(undefined, {value: data});
            fs.writeFileSync(location, encryptedDat);
        } catch(err){
            throw err;
        }

    }

    if(typeof module === "object" && module.exports){
        module.exports = TDcrpt;
    }
})();
