import { app, autoUpdater, BrowserWindow, ipcMain, dialog, Menu, Tray } from 'electron';
require('electron-debug')();

var http = require('http');
var fs = require('fs');
var request = require('superagent');
var jsdom = require('jsdom');
var {JSDOM} = jsdom;
var url = require('url');
var mime = require('mime');
var path = require('path');
var bLauncher = require('launch-browser');        // Launch-Browser
var autoLaunch = require('auto-launch');
var queryString = require('query-string');         // An easy way to parse URL queries
const twitterAPI = require('node-twitter-api');    // Twitter Authenticator
var twit = require('twit');                        // Twitter Interface
const cryptoJS = require('crypto-js');             // For cyphers

const readline = require('readline');
const {google} = require('googleapis');

var T;                                             // The Twitter Bot
const coreSettingsLoc = `${__dirname}\\bin\\loc.dat`;
const twitDataLoc = `${__dirname}\\bin\\tw.dat`;       // Directory of the twitter data file
const initDataLoc = `${__dirname}\\bin\\init.dat`;       // Directory of the twitter data file
const disDataLoc = `${__dirname}\\bin\\dis.dat`;
const twchDataLoc = `${__dirname}\\bin\\twch.dat`;
const sheetsDataLoc = `${__dirname}\\bin\\sheets.dat`;

const assignedCodesLoc = `${__dirname}\\lib\\assignedcodes.json`;
const storedCodesLoc = `${__dirname}\\lib\\storedcodes.json`;
const keyPass = 'WarframeFanChannels';

var appIcon;
var gcgIcon = path.join(__dirname, '/media/logo/gcg_icon_.ico');
var gcgIcon_wire = path.join(__dirname, '/media/logo/gcg_icon_wire.ico');

var config = {
    pc: '',
    ps4: '',
    xb1: ''
}
var coreSettings = {
    options: {
        run_on_start: false
    }
};

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let child;
let popup;
let browser;

const createWindow = () => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 600,
		height: 800,
        minHeight: 760,
		minWidth: 350,
		maxWidth: 1020,
		backgroundColor: '#3B414F',
		frame: true,
		autoHideMenuBar: true,
		icon: gcgIcon
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

    mainWindow.on('minimize', function(event){
        appIcon.setImage(gcgIcon);
        event.preventDefault();
        mainWindow.hide();
        appIcon.displayBalloon({
            icon: gcgIcon,
            title: 'Glyph Code Grabber',
            content: 'Glyph Code Grabber has been minimized. Check the System tray to open it again.'
        })

        var contextMenu2 = Menu.buildFromTemplate([
            {
                label: 'Show App',
                click:  function(){
                    mainWindow.show();
                }
            },
            {
                label: 'Quit',
                click:  function(){
                    application.isQuiting = true;
                    application.quit();
                }
            }
        ]);
        appIcon.setToolTip('Glyph Code Grabber');
        appIcon.setContextMenu(contextMenu2);
    });

    // When the main window is shown
    mainWindow.on('show', function(event){
        appIcon.setImage(gcgIcon_wire);
        var contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quit',
                click:  function(){
                    application.isQuiting = true;
                    application.quit();
                }
            }
        ]);
        appIcon.setContextMenu(contextMenu);
    });

    appIcon = new Tray(gcgIcon_wire);
    appIcon.setToolTip('Glyph Code Grabber');
    appIcon.on('double-click', function() {
        mainWindow.show();
    });


	// Twitter data json init
	fs.access(twitDataLoc, fs.constants.F_OK, (err) => {
		if (err) {
			fs.readFile(initDataLoc, (err, data) => {
				var text = decryptData(undefined, {
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
				let dec = encryptData(undefined, {
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
				let dat = JSON.parse(decryptData(undefined, {value: data} ));
				if (dat.access_token && dat.access_secret) {
					connectTwitter();
				}
			}

		});
	});
    mkTwitchCfg();

    // INIT of the codes storage
    fs.access(storedCodesLoc, fs.constants.F_OK, (err) => {
        if(err){
            let codesJSON = {
                "pc":  [],
                "ps4": [],
                "xb1": []
            }
            fs.writeFile(storedCodesLoc, JSON.stringify(codesJSON), (err) => {
                if(err){console.log('Couldn\'t create the codes storage.');}
            });
        }
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

// CORE Settings ---------------------------------------------------------------
function setCoreSettings(event, arg){
    let encryptedData = encryptData(undefined, {value: arg.value});
    fs.writeFile(coreSettingsLoc, encryptedData, (err) => {
        if(err){
            console.error(err);
        }
        else{
            console.log('Saved the Core Settings.');
        }
    });
}
ipcMain.on('set-core-settings', setCoreSettings);

function getCoreSettings(event, arg){
    fs.readFile(coreSettingsLoc, (err, dat) => {
        if(err){
            console.error(err);
        }
        else{
            let decryptedData = decryptData(undefined, {value: dat});
            if(arg && arg.callback){
                arg.callback(decryptedData);
            }
            else{
                if(event != 0){
                    event.sender.send('send-core-settings', decryptedData);
                }
                return decryptedData;
            }
        }

    });
}
ipcMain.on('get-core-settings', getCoreSettings);

function resetCoreSettings(event, arg){
    let blankSettings = {
        options: {
            run_on_start: false
        }
    };
    setCoreSettings(0, {value: JSON.stringify(blankSettings)});
}
ipcMain.on('reset-core-settings', resetCoreSettings);

// LOCATION INTERRACTIONS -------------------------------------------------------

ipcMain.on('get-config', (event, arg) => {
    let cfg = JSON.stringify(config);
    event.sender.send('send-config', cfg);
});

ipcMain.on('set-config', (event, arg) => {
    let config = JSON.parse(arg);
});

// GCGrabber -------------------------------------------------------------------

var GCGrabber = require('../backend_modules/GCGrabber.js');


ipcMain.on('grab-code', (event, arg) => {
    GCGrabber.codeGrab(arg.platform, arg.numCodes, storedCodesLoc, (codes, err) =>{
        event.sender.send('grabbed-codes', {"codes": codes});
    });
});

ipcMain.on('append-codes', (event, arg) => {
    let codez = [];
    fs.readFile(arg.location, (err, text) => {
        if(err) throw err;
        text.toString().split('\n').forEach( (ln, i) => {
            if(err){throw err;return;}
            codez[i] = ln.trim();
        });
        GCGrabber.appendCodes(arg.platform, codez, storedCodesLoc, (status) => {
            event.sender.send('append-codes-success', status);
        });
    });

});
ipcMain.on('clear-codes', (event, arg) => {
    GCGrabber.clearCodes(arg.platform, storedCodesLoc, (status) => {
        event.sender.send('codes-clear-success', status);
    });
});

ipcMain.on('get-num-codes', (event, arg) => {
    GCGrabber.getCodeNums(storedCodesLoc, (numCodesOBJ) => {
        event.sender.send('num-codes', numCodesOBJ);
    });
});


// Other Windows ---------------------------------------------------------------

const createPopup = (filename) => {
    popup = new BrowserWindow({
        height: 200,
        width: 400,
        minHeight: 200,
        minWidth: 400,
        maxHeight: 200,
        maxWidth: 400,
        autoHideMenuBar: true,
        backgroundColor: '#3B414F',
        icon: gcgIcon
    });
    popup.loadURL(`file://${__dirname}/${filename}.html`);

    popup.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		popup = null;
	});
    popup.on('ready', () => {

    });
}

const newWebView = (event, arg) => {
    console.log('Opening a browser window.');
    browser = new BrowserWindow({
        parent: mainWindow,
        width: 600,
		height: 800,
        minHeight: 730,
		minWidth: 350,
        autoHideMenuBar: true,
        backgroundColor: '#3B414F',
        icon: gcgIcon
    });
    JSDOM.fromFile(`${__dirname}/webview.html`).then(dom => {
        const document = dom.window.document;
        const bodyEl = document.body; // implicitly created
        bodyEl.innerHTML = `<webview id="webview" src="${arg.url}"></webview>`;
        // console.log(dom.serialize());
        fs.writeFile(`${__dirname}/webview.html`, dom.serialize(), (err) => {
            if(err){
                throw err;
            }
            else{
                console.log('Changed the URL');
                browser.loadURL(`file://${__dirname}/webview.html`);
            }
        });
        console.log(bodyEl);
    }).catch(console.log);



    browser.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		browser = null;
	});
    browser.on('ready', () => {

    });
}
ipcMain.on('open-browser2', newWebView);

// For Updating ----------------------------------------------------------------
require('update-electron-app')({
    repo: 'Pckool/GCG_v2.0-Public',
    updateInterval: '5 minutes',
    logger: require('electron-log')
});

// Electron is dev
const isDev = require('electron-is-dev');

if (isDev) {
    // require('electron-reload')(__dirname);
	console.log('Running in development');
} else {
	console.log('Running in production');
}

// For auto-launch -------------------------------------------------------------
var gcgAutoLauncher = new autoLaunch({
    name: 'Glyph_Code_Grabber'
});
function autoLauncher(event, arg){
    if(arg.enabled){
        gcgAutoLauncher.enable()
        .then( function(){
            console.log('Launch on Start Enabled!');
        })
        .catch(function(err){
            console.log('yeet');
            throw err;
        });

    }
    else{
        gcgAutoLauncher.disable()
        .then( function(){
            console.log('Launch on Start Disabled!');
        })
        .catch(function(err){
            throw err;
        });

    }
}
ipcMain.on('auto-launch', autoLauncher);

gcgAutoLauncher.isEnabled()
.then(function(isEnabled){
    if(isEnabled){
        return;
    }
    gcgAutoLauncher.enable();
})
.catch(function(err){
    // handle error
});

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
            if(!req.url.includes('/wurl')){
                console.log('Got a request to open a browser with this query: ' + req.url.substr(indexOfQuery) );
                bLauncher('https://api.twitch.tv/kraken/oauth2/authenticate'+ req.url.substr(indexOfQuery), {browser: ["chrome", "firefox"]}, (e, browser) => {
                    if(e) return console.log(e);
                    browser.on('stop', function(code){
                        console.log( 'Browser closed with exit code:', code );
                    });
                });
            }
            else{
            }
        }
        if(req.url.includes('-passport')){
            console.log('BEING SENT SOMETHING FOR TWITCH PASSPORT');
            let queryObject = queryString.parse(req.url.substr(indexOfQuery));
            // console.log("in server function: " + JSON.stringify(dat));
            if(queryObject.code){
                storeTwitchCode( queryObject.code );
            }


            if(browser){
                browser.close();
            }

        }
    }

    // if the request is for Google Sheets
    else if(req.url.includes('/sheets')){

        // This is for a request to open a new browser!
        if(req.url.includes('-passport')){
            console.log('BEING SENT SOMETHING FOR GSHEETS PASSPORT');
            let queryObject = queryString.parse(req.url.substr(indexOfQuery));
            console.log("in server function: " + JSON.stringify(queryObject));
            if(queryObject){
                oauthAdd(queryObject.code);
                console.log(queryObject);
            }
            if(browser){
                browser.close();
            }

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
                let dat = JSON.parse(decryptData(undefined, {value: data}));
                dat.verifier = tokens.oauth_verifier;
                dat = JSON.stringify(dat)
                let dec = encryptData(undefined, {value: dat});
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
    		res.write('Finshed! You can close this tab now.');
    		res.end();
    	});
    }

}
var server = http.createServer(handleRequest);
server.listen(8888, function() {
	console.log('HTTP server started at http://localhost:8888');
});


// Encryption ------------------------------------------------------------------ Encryption

var TDcrpt = require('../backend_modules/TDcrpt.js');

var encryptData = TDcrpt.encryptData;
ipcMain.on('encrypt-data', encryptData);

var decryptData = TDcrpt.decryptData;
ipcMain.on('decrypt-data', decryptData);

var getEncryptedData = TDcrpt.getEncryptedData;

var setEncryptedData = TDcrpt.setEncryptedData;

// GETTING USER LIST -----------------------------------------------------------
function getRegList(event){
    fs.readFile(assignedCodesLoc, (err, reg_list) => {
        console.log('retrieved list... Sending it now.');
        let list = JSON.parse(reg_list);
        // console.log(JSON.stringify(list));
        event.sender.send('send-reg-list', {"list": JSON.stringify(list)});
    });
}
ipcMain.on('get-reg-list', getRegList);


// Twitter API data ------------------------------------------------------------ Twitter API data
var twitter;

ipcMain.on('get-twi-keys', (event) => {
    getEncryptedData(twitDataLoc, (dat) => {
        let parsedDat = JSON.parse(dat);
        twitter = new twitterAPI({
            consumerKey: parsedDat.consumer_key,
            consumerSecret: parsedDat.consumer_secret,
            callback: 'http://localhost:8888'
        });
        console.log('Twitter Bot Primed.');
    });
});

function getTwitData(event, arg) {
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
ipcMain.on('get-data-twit', getTwitData);

function setTwitData(event, arg) {
    let dat = encryptData(undefined, {value: arg.config});
    fs.writeFile(twitDataLoc, dat, (err) => {
        if (err) throw err;
        else{
            console.log('Saved Twitter Data!');
        }
    });
}
ipcMain.on('set-data-twit', setTwitData);



ipcMain.on('get-access_token-twit', (event, arg) => {
    twitter.getRequestToken( (err, requestToken, requestTokenSecret, results) => {
        if(err){
            console.log('Error getting the OAuth request Token...');
        }
        else{
            getTwitData(undefined, {callback : (data) => {
                let dat = JSON.parse(data);
                dat.request_token = requestToken
                dat.request_secret = requestTokenSecret
                console.log('I am sending the twitter config');
                event.sender.send('send-access_token-twit', dat);
                dat = JSON.stringify(dat);
                let dec = encryptData(undefined, {value: dat});
                setTwitData(undefined, {config: dec});
            }});
        }
    });
});


function getTwitAccessTokens(){
    fs.readFile(twitDataLoc, (err, data) => {
        if(err) throw err;
        let dat = JSON.parse(decryptData(undefined, {value: data}));
        twitter.getAccessToken(dat.request_token, dat.request_secret, dat.verifier, (err, accessToken, accessSecret, results) => {
            if(err) throw err;
            else{
                dat.access_token = accessToken;
                dat.access_secret = accessSecret;
                dat = JSON.stringify(dat);
                let dec = encryptData(undefined, {value: dat});
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
        let dat = JSON.parse(decryptData(undefined, {value: data}));
        twitter.verifyCredentials(dat.access_token, dat.access_secret, {}, function(err, data, response){
            if(err){
                if(event) event.sender.send('twit-authed', false);
                console.log('Error while verifying twitter credentials: ' + err.stack);
            }
            else{
                connectTwitter();
                if(event) event.sender.send('twit-authed', true);
            }
        });
    });
}
ipcMain.on('verify-twit-auth', twitVerify);

function clearTwitterData(event){
    fs.readFile(initDataLoc, (err, data) => {
        var jsn = JSON.parse(decryptData(undefined, {value: data}));
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
        let dec = encryptData(undefined, {value: dat});
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
ipcMain.on('reset-twit-data', clearTwitterData);

function connectTwitter(){
    fs.readFile(twitDataLoc, (err, data) => {
        if(err) throw err;
        else{
            let dat = JSON.parse(decryptData(undefined, {value: data}));
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
function getTwitchCfg(event, arg){
    getEncryptedData(twchDataLoc, (dat) => {
        if(event != undefined){
            event.sender.send( 'loaded-data-twch',  decryptedDat);
        }
        if(arg.callback){
            arg.callback(decryptedDat);
        }

        console.log('Loaded Twitch Data!');
    });
}
ipcMain.on('get-data-twch', getTwitchCfg);

/**
 * PLEASE SEND A STRING in the config variable in the arg object.
 * @param  {EventObject} event Used with IPC. please set this to 'undefined' if you are using this as only a function
 * @param  {Object} arg   Looks for 'config' and 'callback'
 * @return {None}       [description]
 */
function saveTwitchCfg(event, arg){
    setEncryptedData(twchDataLoc, arg.config, (err)=>{
        if(err){

        }
        else{
            if(arg.callback){
                arg.callback('Saved Twitch Data!');
            }
            else{
                console.log('Saved Twitch Data!');
            }
        }

    });
}
ipcMain.on('save-data-twch', saveTwitchCfg);

/**
 * Checks for a dat file for twitch. If there is none found, it will create it.
 * @return {None}
 */
function mkTwitchCfg(){
    fs.access(twchDataLoc, fs.constants.F_OK, (err) => {
        if(err){
            let twchcfg = {
                client_id: '03ppab2gojuahyr7ouocpnbclbhof7',
                client_secret: 'b0i83zo2okxjfscgqxyfr4kagm4ad2',
                scopes: 'channel_subscriptions channel_check_subscription',
                code: '',
                authorization_code: ''
            };
            saveTwitchCfg(undefined, {
                config: JSON.stringify(twchcfg),
                callback: (result) => {
                    console.log('Created the Twitch config.');
                }
            });
        }
        else{
            console.log('twitch data file found!');
        }
    });
}
ipcMain.on('make-data-twch', mkTwitchCfg);

/**
 * overwites the twitch cfg file
 * @return {None}
 */
function resetTwitchCfg(){
    fs.access(twchDataLoc, fs.constants.F_OK, (err) => {
        if(err){
            console.log('No twitch data file found! creating it now...');
            mkTwitchCfg();
        }
        else{
            let twchcfg = {
                client_id: '03ppab2gojuahyr7ouocpnbclbhof7',
                client_secret: 'b0i83zo2okxjfscgqxyfr4kagm4ad2',
                scopes: 'channel_subscriptions channel_check_subscription',
                code: '',
                authorization_code: ''
            };
            console.log('What I\'m sending to encrypt: ' + twchcfg);
            let dat = encryptData(undefined, {
                value: JSON.stringify(twchcfg)
            });
            fs.writeFile(twchDataLoc, dat, (err) => {
                if (err) throw err;
                else{
                    console.log('Created Twitch Data file!');
                }
            });
        }
    });
}
ipcMain.on('reset-data-twch', resetTwitchCfg);


function getTwitchToken(){
    getTwitchCfg(undefined, {
        callback: (dat) => {
            let parsedDat = JSON.parse(dat);
            console.log(parsedDat);

            request.post('https://id.twitch.tv/oauth2/token')
            .query({
                client_id: parsedDat.client_id,
                client_secret: parsedDat.client_secret,
                code: parsedDat.code,
                grant_type: 'authorization_code',
                redirect_uri: 'http://localhost:8888/twitch-passport'
            })
            .end( (err, res) => {
                if(err){
                    console.log(err);
                }
                else {
                    console.log(res.body);
                    parsedDat.access_token = res.body.access_token;
                    parsedDat.refresh_token = res.body.refresh_token;
                    parsedDat.expires_in = res.body.expires_in;
                    saveTwitchCfg(undefined, {
                        config: JSON.stringify(parsedDat)
                    });
                }

            });
        }
    });
}

function refreshTwitchToken(){
    getTwitchCfg(undefined, {
        callback: (dat) => {
            console.log(dat);
            let parsedDat = JSON.parse(dat);
            request.get('https://id.twitch.tv/oauth2/token')
            .query({
                grant_type: 'refresh_token',
                client_id: parsedDat.client_id,
                client_secret: parsedDat.client_secret,
                refresh_token: 'authorization_code',
            })
            .end( (err, res) => {
                if(err){
                    console.log(err);
                }
                else{
                    parsedDat.access_token = res.body.access_token;
                    parsedDat.refresh_token = res.body.refresh_token;
                    parsedDat.expires_in = res.body.expires_in;
                    saveTwitchCfg(undefined, {
                        config: JSON.stringify(parsedDat)
                    });
                }
            });
        }
    });
}


function storeTwitchCode(code){
    getTwitchCfg(undefined, {
        callback: (dat) => {
            console.log(dat);
            let parsedDat = JSON.parse(dat);
            parsedDat.code = code;
            saveTwitchCfg(0, {
                config: JSON.stringify(parsedDat),
                callback: () => {
                    // Try to get the token after saving
                    getTwitchToken();
                }
            });
        }
    });
}




// FOR DISCORD -----------------------------------------------------------------
ipcMain.on('save-data-dis', (event, arg) => {
    setEncryptedData(disDataLoc, arg, (err) => {
        if(err){
            event.sender.send('saved-data-dis', {error: err});
        }
        else{
            console.log('Saved Discord Data!');
            event.sender.send('saved-data-dis');
        }
    });
});
ipcMain.on('load-data-dis', (event, arg) => {
    getEncryptedData(disDataLoc, (dat) => {
        event.sender.send( 'loaded-data-dis', dat);
        console.log('Loaded Discord Data!');
    });
});


// FOR Sheets API -----------------------------------------------------


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];


// Load client secrets from a local file and encrypt them.
// fs.readFile('src/lib/credentials.json', (err, content) => {
// 	if (err) return console.log('Error loading client secret file:', err);
// 	// Authorize a client with credentials, then call the Google Sheets API.
//     setEncryptedData(sheetsDataLoc, '' + content, (err) => {
//         if(err) throw err;
//         else{
//             // sheetsAuthorize(JSON.parse(content), pullFromSheet);
//             getSheetsConfig();
//         }
//     });
// });
var oAuth2Client;
const sheetsOauthLoc = `${__dirname}\\bin\\gs_oAuth2.dat`;

function getSheetsConfig(callback){
    getEncryptedData(sheetsDataLoc, (content) => {
        console.log('Starting GSheets Auth...');
        sheetsAuthorize(JSON.parse(content), (oAuth2Client) => {
            return;
        });
    });
}
function startGsheetsAuth(event, arg){
    getSheetsConfig(arg.callback);
}
ipcMain.on('gsheets-auth', startGsheetsAuth);


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function sheetsAuthorize(credentials, callback) {
	const {client_secret, client_id, redirect_uris} = credentials.installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

	// Check if we have previously stored a token.
	fs.readFile(sheetsOauthLoc, (err, token) => {
		if (err) return launchAuthSite(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));

        setEncryptedData(sheetsOauthLoc, JSON.stringify(oAuth2Client), (err) => {
            if(err) throw err;
        });
		callback(oAuth2Client);
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function launchAuthSite(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES,
	});
    newWebView(undefined, {
        url: authUrl,
    });
}
function oauthAdd(code){
    oAuth2Client.getToken(code, (err, token) => {
		if (err) return console.error('Error while trying to retrieve access token', err);
		oAuth2Client.setCredentials(token);
		// Store the token to disk for later program executions
        setEncryptedData(sheetsOauthLoc, JSON.stringify(oAuth2Client), (err) => {
            if(err) throw err;
        });
	});
}

function clearGSheetsToken(event, arg) {
    fs.unlink(sheetsOauthLoc, (err) => {
        if (err) throw err;
    })
}
ipcMain.on('clear-gsheets-token', clearGSheetsToken);

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function pullFromSheet(event, arg) {
    getEncryptedData(sheetsOauthLoc, (content) => {
        let AuthClientData = JSON.parse(content);

        let AuthClient = new google.auth.OAuth2(AuthClientData._clientId, AuthClientData._clientSecret, AuthClientData.redirectUri);
		AuthClient.setCredentials(AuthClientData.credentials);

        const sheets = google.sheets({
    		version: 'v4',
    		AuthClient
    	});
        let apiRanges = new Array();

        if(arg.tables.pc){
            apiRanges[0] = `${arg.tables.pc}!A1:A9000`;
        }
        if(arg.tables.ps4){
            apiRanges[1] = `${arg.tables.ps4}!A1:A9000`;
        }
        if(arg.tables.xb1){
            apiRanges[2] = `${arg.tables.xb1}!A1:A9000`;
        }
        var apiRangesFiltered = [];
        apiRangesFiltered = apiRanges.filter(function (el) {
            return el != null;
        });

    	sheets.spreadsheets.values.batchGet({
    		spreadsheetId: arg.sheetID,
    		ranges: apiRangesFiltered,
            majorDimension: "COLUMNS",
            auth: AuthClient
    	}, (err, res) => {
    		if (err) {
                console.log(err)
                return dialog.showErrorBox('Something Went Wrong...', 'It looks like you didn\'t enter the correct table name(s) or spreadsheetID. Please double check your inputs.');
            }
            let pcCodes  = [];
            let ps4Codes = [];
            let xb1Codes = [];

            // Each selected platform
            res.data.valueRanges.forEach(function(el, i){
                if(arg.tables.pc.length > 1 && el.range.toLowerCase().includes( arg.tables.pc.toLowerCase() )){
                    // Each sub array
                    pcCodes = el.values[0];
                }
                if(arg.tables.ps4.length > 1 && el.range.toLowerCase().includes( arg.tables.ps4.toLowerCase() )){
                    // Each sub array
                    ps4Codes = el.values[0];
                }
                if(arg.tables.xb1.length > 1 && el.range.toLowerCase().includes( arg.tables.xb1.toLowerCase() )){
                    // Each sub array
                    xb1Codes = el.values[0];
                }
            });
            let pcCodesTrimmed = [];
            pcCodes.forEach(function(el, i){
                pcCodesTrimmed[i] = el.trim();
            });
            let ps4CodesTrimmed = [];
            ps4Codes.forEach(function(el, i){
                ps4CodesTrimmed[i] = el.trim();
            });
            let xb1CodesTrimmed = [];
            xb1Codes.forEach(function(el, i){
                xb1CodesTrimmed[i] = el.trim();
            });

            GCGrabber.appendCodes('pc', pcCodesTrimmed, storedCodesLoc, () => {
                GCGrabber.appendCodes('ps4', ps4CodesTrimmed, storedCodesLoc, () => {
                    GCGrabber.appendCodes('xb1', xb1CodesTrimmed, storedCodesLoc, () => {
                        event.sender.send('gsheets-extracted', 'Succcess');
                    });
                });
            });
    	});

    });

}
ipcMain.on('gsheets-extract', pullFromSheet)
