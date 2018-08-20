import { app, autoUpdater, BrowserWindow, ipcMain, dialog } from 'electron';
require('electron-debug')();
//require('electron-reload')(__dirname);
var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime');
var path = require('path');
var bLauncher = require('launch-browser');        // Launch-Browser
var queryString = require('query-string');         // An easy way to parse URL queries
const twitterAPI = require('node-twitter-api');    // Twitter Authenticator
var twit = require('twit');                        // Twitter Interface
const cryptoJS = require('crypto-js');             // For cyphers

var T;                                             // The Twitter Bot
var twitDataLoc = `${__dirname}/bin/tw.dat`;       // Directory of the twitter data file
var initDataLoc = `${__dirname}/bin/init.dat`;       // Directory of the twitter data file
var disDataLoc = `${__dirname}/bin/dis.dat`;
var twchDataLoc = `${__dirname}/bin/twch.dat`;
const keyPass = 'WarframeFanChannels';             // Password for encryption

var config = {
    pc: '',
    ps4: '',
    xb1: ''
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let child;
let popup;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 600,
		height: 800,
        minHeight: 730,
		minWidth: 350,
		maxWidth: 1020,
		backgroundColor: '#3B414F',
		frame: true,
		autoHideMenuBar: true,
		icon: path.join(__dirname, '/media/logo/gcg_icon_.ico'),
	});

	// and load the index.html of the app.
	mainWindow.loadURL(`file://${__dirname}/index.html`);

	// Open the DevTools.
	// mainWindow.webContents.openDevTools();

	// Emitted when the window is closed.
	mainWindow.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null;
	});

	// Twitter data json init
	fs.access(twitDataLoc, fs.constants.F_OK, (err) => {
		if (err) {
			fs.readFile(initDataLoc, (err, data) => {
				var text = decryptData(0, {
					value: data
				});
				var jsn = JSON.parse(text);
				var twitData = {
					consumer_key: jsn.consumer_key,
					consumer_secret: jsn.consumer_secret,
					request_token: '',
					request_secret: '',
					verifier: '',
					access_token: '',
					access_secret: ''
				}
				var dat = JSON.stringify(twitData);
				let dec = encryptData(0, {
					value: dat
				});
				fs.writeFile(twitDataLoc, dec, (err) => {
					if (err) {
						console.log(err);
						fs.unlink(twitDataLoc, (err) => {
							if (err) throw err;
							console.log('Removed the file I just tried to make.');
						});
						throw err;
					}
					console.log('Made the new file')
				});
				return;
			});

		}
		console.log('Twitter Data file found! Loading now...');

		fs.readFile(twitDataLoc, (err, data) => {
			if (err) {
				throw err;
			} else {
				let dat = JSON.parse(decryptData(0, {value: data} ));
				if (dat.access_token && dat.access_secret) {
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

const createPopup = (filename) => {
    popup = new BrowserWindow({
        height: 200,
        width: 400,
        minHeight: 200,
        minWidth: 400,
        maxHeight: 200,
        maxWidth: 400,
        autoHideMenuBar: true,
        backgroundColor: '#3B414F'
    });

    popup.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		popup = null;
	});
    popup.on('ready', () => {

    });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// For Updating ----------------------------------------------------------------
require('update-electron-app')({
    repo: 'Pckool/GCG_v2.0-Public',
    updateInterval: '5 minutes',
    logger: require('electron-log')
});

// Electron is dev
const isDev = require('electron-is-dev');

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}

// Localized Server ------------------------------------------------------------ Localized Server
function handleRequest(req, res) {
    let indexOfQuery = 0;
    if(req.url.includes('?')){
        indexOfQuery = req.url.indexOf('?');
    }

    if(req.url.includes('/wurl')){
        let query = queryString.parse(req.url.substr(indexOfQuery));
        bLauncher(query.hurl__, {browser: ["chrome", "firefox"]}, function(e, browser){
            if(e){
                return console.log(e);
            }
            browser.on('stop', function(code){

            console.log( 'Browser closed with exit code:', code );

            });
        });
    }

    // if the request if for discord auth
    if(req.url.includes('/discord') ){
        // This is for a request to open a new browser!
        if(req.url.includes('/open_browser') && indexOfQuery >= 0){
            if(!req.url.includes('/wurl')){
                console.log('Got a request to open a browser with this query: ' + req.url.substr(indexOfQuery) );
                bLauncher('http://discordapp.com/api/oauth2/authorize'+ req.url.substr(indexOfQuery), {browser: ["chrome", "firefox"]}, (e, browser) => {
                    if(e) return console.log(e);
                    browser.on('stop', function(code){
                        console.log( 'Browser closed with exit code:', code );
                    });
                });
            }
            else{
            }
        }

        if(req.url.includes('/success_') ){
            console.log('query: ' + req.url.substr(indexOfQuery));
            res.send(req.data);
            res.end();
        }
        else if(req.url.includes('/failure_')){
            console.log('query: ' + req.url.substr(indexOfQuery));
        }
    }
    // if the request id for twitter auth
    else if(req.url.includes('/twitter') ){
        // This is for a request to open a new browser!
        if(req.url.includes('/open_browser') && indexOfQuery >= 0){
            console.log('Got a request to open a browser with this query: ' + req.url.substr(indexOfQuery) );
        }

    }
    // if the request is for twitch
    else if(req.url.includes('/twitch')){
        // This is for a request to open a new browser!
        if(req.url.includes('/open_browser') && indexOfQuery >= 0){
            console.log('Got a request to open a browser with this query: ' + req.url.substr(indexOfQuery) );
        }
    }

    /**
     * // NOTE: Try to change this function/if blck so that it can recieve the domain+path within the query
     */
    /**
     * This checks for a discord oauth return.
     * If there is one, then we should check what the return data is.
     */

    else{
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
                    getTwitAccessTokens();
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

}
var server = http.createServer(handleRequest);
server.listen(8888, function() {
	console.log('HTTP server started at http://localhost:8888');
});


// Encryption ------------------------------------------------------------------ Encryption
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


// Twitter API data ------------------------------------------------------------ Twitter API data
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
                bLauncher('https://twitter.com/oauth/authenticate?oauth_token=' + requestToken, {browser: ["chrome", "firefox"]}, function(e, browser){
                    if(e){
                        return console.log(e);
                    }
                    browser.on('stop', function(code){
                        console.log( 'Browser closed with exit code:', code );
                    });
                });
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


function getTwitAccessTokens(){
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
    fs.readFile(initDataLoc, (err, data) => {
        var jsn = JSON.parse(decryptData(0, {value: data}));
        var twitData = {
            consumer_key:     jsn.consumer_key,
            consumer_secret:  jsn.consumer_secret,
            request_token:    '',
            request_secret:   '',
            verifier:         '',
            access_token:     '',
            access_secret:    ''
        }
        let dat = JSON.stringify(twitData);
        let dec = encryptData(0, {value: dat});
        fs.writeFile(twitDataLoc, dec, (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log('Twitter Data Reset')
        });
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

// FOR TWITCH.TV ---------------------------------------------------------------
function getTwchDat(event, arg){
    fs.readFile(twchDataLoc, (err, dat) => {
        if (err) throw err;
        else{
            event.sender.send( 'loaded-data-twch', decryptData(0, {value: dat}) );
            console.log('Loaded Twitch Data!');
        }
    });
}
ipcMain.on('get-twch-data', getTwchDat);

function saveTwchDat(event, arg){
    let dat = encryptData(0, {value: arg});
    fs.writeFile(twchDataLoc, dat, (err) => {
        if (err) throw err;
        else{
            console.log('Saved Twitch Data!');
        }
    });
}
ipcMain.on('save-twch-data', saveTwchDat);


// FOR DISCORD -----------------------------------------------------------------
ipcMain.on('save-data-dis', (event, arg) => {
    let dat = encryptData(0, {value: arg});
    fs.writeFile(disDataLoc, dat, (err) => {
        if (err) throw err;
        else{
            console.log('Saved Discord Data!');
        }
    });
});
ipcMain.on('load-data-dis', (event, arg) => {
    fs.readFile(disDataLoc, (err, dat) => {
        if (err) throw err;
        else{
            event.sender.send( 'loaded-data-dis', decryptData(0, {value: dat}) );
            console.log('Loaded Discord Data!');
        }
    });
});

//LOCATION INTERRACTIONS -------------------------------------------------------
ipcMain.on('get-config', (event, arg) => {
    let cfg = JSON.stringify(config);
    event.sender.send('send-config', cfg);
});

ipcMain.on('set-config', (event, arg) => {
    let config = JSON.parse(arg);
});


// FOR WEB BROWSER OPENING -----------------------------------------------------

ipcMain.on('open-browser', (event, arg) => {
    bLauncher(arg.url, arg.browser, function() {
        if(e) return console.log(e);
        browser.on('stop', function(code){
            console.log('Browser closed with the exit code: ' + code)
        });
    });
});
