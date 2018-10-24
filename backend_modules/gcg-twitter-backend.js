
(function(){
    var BackendTwit = {}

    BackendTwit.getTwitData = function (event, arg) {
        getEncryptedData(twitDataLoc, (decryptedDat) => {
            if(event != undefined){
                event.sender.send( 'send-data-twit',  decryptedDat);
            }
            else if(arg.callback){
                arg.callback(decryptedDat);
            }

            console.log('Loaded Twitter Data!');
        });
    }

    BackendTwit.setTwitData = function (event, arg) {
        let dat = encryptData(undefined, {value: arg.config});
        fs.writeFile(twitDataLoc, dat, (err) => {
            if (err) throw err;
            else{
                console.log('Saved Twitter Data!');
            }
        });
    }

    BackendTwit.resetTwitData =function (event, arg) {

    }

    if (typeof module === 'object' && module.exports) {
        module.exports = BackendTwit;
    }
})();
