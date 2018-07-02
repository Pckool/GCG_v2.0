import { app, autoUpdater, BrowserWindow, ipcMain, dialog } from 'electron';
require('electron-debug')();
require('electron-reload')(__dirname);
var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime');
var path = require('path');
var queryString = require('query-string');         // An easy way to parse URL queries
const twitterAPI = require('node-twitter-api');    // Twitter Authenticator
var twit = require('twit');                        // Twitter Interface
const cryptoJS = require('crypto-js');             // For cyphers

var T;                                             // The Twitter Bot
var twitDataLoc = `${__dirname}/bin/tw.dat`;       // Directory of the twitter data file
const keyPass = 'WarframeFanChannels';             // Password for encryption

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let child;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 600,
		height: 800,
        minWidth: 350,
		backgroundColor: '#3B414F',
        autoHideMenuBar: true,
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

    // Twitter data json init
    fs.access(twitDataLoc, fs.constants.F_OK, (err) => {
        if(err){
            var twitData = {
                consumer_key:     '0IxvGU3ZW5ui4WOOSns1aBCYf',
                consumer_secret:  'T2YUYViTBCUPWkmtVBLSvm15BTF6H4Pd9gvvr4PihSuJKV88Ub',
                request_token:    '',
                request_secret:   '',
                verifier:         '',
                access_token:     '',
                access_secret:    ''
            }
            var dat = JSON.stringify(twitData);
            let dec = encryptData(0, {value: dat});
            fs.writeFile(twitDataLoc, dec, (err) => {
                if (err) {
                    console.log(err);
                    fs.unlink(twitDataLoc, (err) => {
                        if(err) throw err;
                        console.log('Removed the file I just tried to make.');
                    });
                    throw err;
                }
                console.log('Made the new file')
            });
            return;
        }
        console.log('Twitter Data file found! Loading now...');

        fs.readFile(twitDataLoc, (err, data) => {
            if(err){
                throw err;
            }
            else{
                let dat = JSON.parse(decryptData(0, {value: data}));
                if(dat.access_token && dat.access_secret){
                    connectTwitter();
                }
            }

        });
    });


};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// For Updating ----------------------------------------------------------------
require('update-electron-app')({
  updateInterval: '10 minutes',
  logger: require('electron-log')
})

// Electron is dev
const isDev = require('electron-is-dev');

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}

// Localized Server ------------------------------------------------------------
function handleRequest(req, res) {
    let query = req.url.substr(1);
    var tokens = queryString.parse(query);
    if(tokens.oauth_token){
        fs.readFile(twitDataLoc, (err, data) => {
            if(err) throw err;
            let dat = JSON.parse(decryptData(0, {value: data}));
            dat.verifier = tokens.oauth_verifier;
            dat = JSON.stringify(dat)
            let dec = encryptData(0, {value: dat});
            fs.writeFile(twitDataLoc, dec, (err) => {
                if(err) throw err;
                console.log('Saved Twitter Data... Proceeding to final step.');
                getAccessTokens();
            });
        });
    }

    var file = path.join(app.getAppPath(), req.url);
	fs.exists(file, function(exists) {
		if (exists && fs.lstatSync(file).isFile()) {

			res.setHeader("Content-Type", mime.lookup(file));
			res.writeHead(200, {
				'Access-Control-Allow-Origin': '*'
			});
			fs.createReadStream(file).pipe(res);
			return;
		}
		res.writeHead(404);
		res.write('Verifying, Please Wait...');
		res.end();
	});
}
var server = http.createServer(handleRequest);
server.listen(8888, function() {
	console.log('HTTP server started at http://localhost:8888');
});


// Encryption ------------------------------------------------------------------
function encryptData(event, arg){
    try{
        var encrpt = cryptoJS.AES.encrypt(arg.value, keyPass);
        if(event !== 0)
            event.sender.send('encrypted-data', encrpt.toString());
        return encrpt;
    }
    catch(err){
        dialog.showErrorBox('Something Went Wrong...', 'Something wasn\'t encrypted properly. Please report this to TDefton!\nError: ' + err.stack);
    }
}
ipcMain.on('encrypt-data', encryptData);

function decryptData(event, arg){
    try{
        var bytes = cryptoJS.AES.decrypt(arg.value.toString(), keyPass);
        var decrpt = bytes.toString(cryptoJS.enc.Utf8);
        if(event !== 0)
            event.sender.send('decrypted-data', decrpt);
        return decrpt;
    }
    catch(err){
        dialog.showErrorBox('Issue Decrypting Some Data', 'Something wasn\'t decrypted properly. Please report this to TDefton!\n\n' + err.stack);
    }
}
ipcMain.on('decrypt-data', decryptData);


// Twitter API data ------------------------------------------------------------
const TwitterApi = require('node-twitter-signin');
var twitter;

ipcMain.on('get-twi-keys', (event) => {
    fs.readFile(twitDataLoc, (err, data) => {
        if(err){throw err}
        else{
            let da = decryptData(0, {value: data});
            let dat = JSON.parse(da);
            twitter = new twitterAPI({
                consumerKey: dat.consumer_key,
                consumerSecret: dat.consumer_secret,
                callback: 'http://localhost:8888'
            });
        	console.log('Twitter Bot Primed.');
        }

    });
});

ipcMain.on('load-page', (event, arg) => {
    twitter.getRequestToken( (err, requestToken, requestTokenSecret, results) => {
        if(err){
            console.log('Error getting the OAuth request Token...');
        }
        else{
            fs.readFile(twitDataLoc, (err, data) => {
                let da = decryptData(0, {value: data});
                let dat = JSON.parse(da);
                dat.request_token = requestToken
                dat.request_secret = requestTokenSecret
                child.loadURL('https://twitter.com/oauth/authenticate?oauth_token=' + requestToken);
                dat = JSON.stringify(dat);
                let dec = encryptData(0, {value: dat});
                fs.writeFile(twitDataLoc, dec, (err) => {
                    if(err) throw err;
                    console.log('Updated Twitter Auth Data');
                });
            });
        }
    });
    console.log('Loading a secure Login Page...');
    child = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        show: false,
        width: 710,
        height: 530,
        autoHideMenuBar: true,
        alwaysOnTop: true
    });
    // child.loadURL('https://twitter.com/oauth/authenticate?oauth_token=' + arg);
    child.once('ready-to-show', () => {
        mainWindow.setEnabled(false);
        child.show();
    });

    child.on('closed', () => {
        mainWindow.setEnabled(true);
    });
    event.sender.send('finished-twit-auth', 'Secure Login Page Loaded...');
    event.sender.send('back-to-home');
});


function getAccessTokens(){
    fs.readFile(twitDataLoc, (err, data) => {
        if(err) throw err;
        let dat = JSON.parse(decryptData(0, {value: data}));
        twitter.getAccessToken(dat.request_token, dat.request_secret, dat.verifier, (err, accessToken, accessSecret, results) => {
            if(err) throw err;
            else{
                dat.access_token = accessToken;
                dat.access_secret = accessSecret;
                dat = JSON.stringify(dat);
                let dec = encryptData(0, {value: dat});
                fs.writeFile(twitDataLoc, dec, (err) => {
                    if(err) throw err;
                    console.log('Saved twitter auth.');
                    child.close();
                    twitVerify();
                });
            }
        });
    });
}

function twitVerify(event){
    fs.readFile(twitDataLoc, (err, data) => {
        let dat = JSON.parse(decryptData(0, {value: data}));
        twitter.verifyCredentials(dat.access_token, dat.access_secret, {}, function(err, data, response){
            if(err){
                if(event) event.sender.send('twit-authed', false);
                console.log('Error while verifying twitter credentials: ' + err.stack);
            }
            else{
                console.log('Connected to Twitter account: ' + data['screen_name']);
                connectTwitter();
                if(event) event.sender.send('twit-authed', true);
            }
        });
    });
}
ipcMain.on('verify-twit-auth', twitVerify);

function clearTwitterData(event){
    var twitData = {
        consumer_key:     '0IxvGU3ZW5ui4WOOSns1aBCYf',
        consumer_secret:  'T2YUYViTBCUPWkmtVBLSvm15BTF6H4Pd9gvvr4PihSuJKV88Ub',
        request_token:    '',
        request_secret:   '',
        verifier:         '',
        access_token:     '',
        access_secret:    ''
    }
    dat = JSON.stringify(dat);
    let dec = encryptData(0, {value: dat});
    fs.writeFile(twitDataLoc, dec, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('Twitter Data Reset')
    });
}
ipcMain.on('clearTwitterAuth', clearTwitterData);

function connectTwitter(){
    fs.readFile(twitDataLoc, (err, data) => {
        if(err) throw err;
        else{
            let dat = JSON.parse(decryptData(0, {value: data}));
            T = new twit({
                consumer_key:         dat.consumer_key,
                consumer_secret:      dat.consumer_secret,
                access_token:         dat.access_token,
                access_token_secret:  dat.access_secret,
                strictSSL: true
            });
            T.get('account/verify_credentials', {
                skip_status: true
            }).catch( (err) => {
                if(err) throw err;
                console.log(err);
            }).then( (result) => {
                console.log('I logged into the Twitter account of: ' + result.data['screen_name']);
            });
        }

    });
}
ipcMain.on('connect-to-twitter', connectTwitter);

function twitterPost(event, postStatus){
    T.post('statuses/update', {
        status: postStatus
    }, function(err, data, response){
        if(err) throw err;
        else{
            console.log(data);
            event.sender.send('twitter-posted-data', data);
        }

    });
}
ipcMain.on('twitter-post', twitterPost);
