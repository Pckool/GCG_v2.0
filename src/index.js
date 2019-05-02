import { app, autoUpdater, BrowserWindow, ipcMain, dialog, Menu, Tray } from 'electron';
require('electron-debug')();

var http = require('http');
var fs = require('fs');
var request = require('superagent');
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

var binLoc;
var libLoc;

var coreSettingsLoc;
var twitDataLoc;      // Directory of the twitter data file
// var initDataLoc;       // Directory of the twitter data file
var disDataLoc;
var twchDataLoc;
var sheetsDataLoc;
var slDataLoc;

var assignedCodesLoc;
var storedCodesLoc;
// ASSIGN CODES ----------------------------------------------------------------
var AssignCodes = require('../backend_modules/AssignCodes.js');

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
		height: 590,
        minHeight: 590,
		minWidth: 350,
		maxWidth: 1020,
		backgroundColor: '#3B414F',
		frame: false,
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
                    app.isQuiting = true;
                    app.quit();
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
                    app.isQuiting = true;
                    app.quit();
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

    // INIT of the codes storage
    var saveLoc = `${app.getPath("documents")}\\GCG`;
    binLoc = `${saveLoc}\\bin`;
    libLoc = `${saveLoc}\\lib`;
    checkDir(saveLoc);
    checkDir(libLoc);
    checkDir(binLoc);

    coreSettingsLoc = `${binLoc}\\loc.dat`;
    twitDataLoc = `${binLoc}\\tw.dat`;       // Directory of the twitter data file
    // initDataLoc = `${binLoc}\\init.dat`;       // Directory of the twitter data file
    disDataLoc = `${binLoc}\\dis.dat`;
    twchDataLoc = `${binLoc}\\twch.dat`;
    sheetsDataLoc = `${binLoc}\\sheets.dat`;
    slDataLoc = `${binLoc}\\sl.dat`;

    assignedCodesLoc = `${libLoc}\\assignedcodes.json`;
    storedCodesLoc = `${libLoc}\\storedcodes.json`;

    checkTwitterConfig();
    mkTwitchCfg();
    mkDiscordCfc();
    mkGsheetsCred();
    slInit();
    AssignCodes.checkAssignedCodes(assignedCodesLoc);

    fs.access(storedCodesLoc, fs.constants.F_OK, (err) => {
        let codesJSON = {
            "pc":  [],
            "ps4": [],
            "xb1": [],
            "switch": []
        }
        if(err){
            fs.writeFile(storedCodesLoc, JSON.stringify(codesJSON, null, 4), (err) => {
                if(err){console.log('Couldn\'t create the codes storage.');}
            });
        }
        else{
            let data;
            let newdat;
            try {
                data = fs.readFileSync(storedCodesLoc);
                newdat = JSON.parse(data);
                if(! newdat.pc) newdat.pc = [];
                if(! newdat.ps4) newdat.ps4 = [];
                if(! newdat.xb1) newdat.xb1 = [];
                if(! newdat.switch) newdat.switch = [];

                fs.writeFile(storedCodesLoc, JSON.stringify(newdat, null, 4), (err) => {
                    if(err){console.log('Couldn\'t create the codes storage.');}
                });

                console.log('found a good assigned codes file.');
            } catch (e) {
                fs.writeFile(storedCodesLoc, JSON.stringify(codesJSON, null, 4), (err) => {
                    if(err){console.log('Couldn\'t create the codes storage.');}
                });

            } finally {

            }

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

ipcMain.on('app-close', (event)=> {
    mainWindow.close();
});

ipcMain.on('app-max', (event)=> {
    if(mainWindow.isMaximized())
        mainWindow.restore();
    else
        mainWindow.maximize();
});

ipcMain.on('app-min', (event)=> {
    mainWindow.minimize();
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow();
	}
});

ipcMain.on('get-app-version', (event, arg) =>{
    event.sender.send('app-version', app.getVersion());
});
ipcMain.on('show-app-version', (event, arg) =>{
    console.log("app version: " + app.getVersion());
    dialog.showMessageBox({
        type: 'info',
        title: 'Version Information',
        message: `Glyph Code Grabber v${app.getVersion()}`,
        buttons: ["OK"],
        icon: gcgIcon
    });
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
    checkFile(coreSettingsLoc, (err) => {
        if(err) {
            fs.writeFileSync(coreSettingsLoc, coreSettings);
        }
        getEncryptedData(coreSettingsLoc, (err, dat) => {
            if(err) console.error(err);
            else{
                if(arg && arg.callback){
                    arg.callback(dat);
                }
                else{
                    if(event != undefined) event.sender.send('send-core-settings', dat);
                    return dat;
                }
            }
        });
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

/**
 * Checks the directory and if it does not exists, it makes it for you
 * @param  {Path|String} dir The path you would like to
 * @return {}     [description]
 */
function checkDir(dir){
    try {
        fs.accessSync(dir, fs.constants.F_OK);
    } catch (e) {
        return fs.mkdirSync(dir);
    } finally {

    }
}

function checkFile(dir, callback){
    fs.access(dir, fs.constants.F_OK, (err) => {
        if(err){
            if(callback) callback(err);
        }
        if(callback) callback();
    });
}

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
    GCGrabber.codeGrab(arg.platform, arg.num_codes, storedCodesLoc, (codes, err) =>{
        let stringCodes = '';
        codes.forEach(function(code, i){
            stringCodes = stringCodes+code+'\n';
            if(typeof arg.user === "undefined"){
                AssignCodes.addUserToDict({id:'N/A', username:'N/A'}, code, assignedCodesLoc, (err, prevCode) =>{
                    if(err){}
                });
            }

        });

        event.sender.send('grabbed-codes', {
            "codes": stringCodes.trim(),
            "platform": arg.platform
        });
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
        let finalCodez = [];
        codez.forEach(function(el, i){
            if( ! AssignCodes.checkCodesDict(el, assignedCodesLoc) ) finalCodez.push(el);
        });
        GCGrabber.appendCodes(arg.platform, finalCodez, storedCodesLoc, (status) => {
            event.sender.send('append-codes-success', status);
        });
    });

});

ipcMain.on('append-codes-all', (event, arg) => {
    let codez = [];
    arg.locations.forEach(function(el){
        fs.readFile(el, (err, text) => {
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
        icon: gcgIcon,
        modal: true,
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

const cheerio = require('cheerio')

function newWebView (event, arg) {
    console.log('Opening a browser window.');
    browser = new BrowserWindow({
        parent: mainWindow,
        modal: false,
        width: 600,
		height: 920,
        minHeight: 920,
		minWidth: 350,
        autoHideMenuBar: true,
        backgroundColor: '#3B414F',
        icon: gcgIcon,
        webPreferences: {
            sandbox: true,
            webviewTag: false,
            allowRunningInsecureContent: true
        }
    });
    browser.loadURL(arg.url);



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
    require('electron-reload')(__dirname);
	console.log('Running in development');
} else {
	console.log('Running in production');
}

// For auto-launch -------------------------------------------------------------
var gcgAutoLauncher = new autoLaunch({
    name: 'Glyph_Code_Grabber'
});
function autoLauncher(event, arg){
    if(arg.enabled === true){
        gcgAutoLauncher.enable()
        .then( function(){
            console.log('Launch on Start Enabled!');
        })
        .catch(function(err){
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

// gcgAutoLauncher.isEnabled()
// .then(function(isEnabled){
//     if(isEnabled){
//         return;
//     }
//     gcgAutoLauncher.enable();
// })
// .catch(function(err){
//     // handle error
// });

// Localized Server ------------------------------------------------------------ Localized Server
function handleRequest(req, res) {
    let indexOfQuery = 0;
    if(req.url.includes('?')){
        indexOfQuery = req.url.indexOf('?');
    }

    console.log('Recieved ' + req.url);
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
            if(browser) browser.close();

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
            if(browser) browser.close();

        }
    }
    // if the request is for streamlabs
    else if(req.url.includes('/streamlabsauth')){
        console.log('Recieved StreamLabs Response..');
        let queryObject = queryString.parse(req.url.substr(indexOfQuery));
        if(queryObject){
            slAuthCont(queryObject.code);
        }
        if(browser) browser.close();
    }

    else if(req.url.includes('/twitterauth')){
        console.log('Recieved Twitter Response..');
        let query = req.url.substr(indexOfQuery);
        var tokens = queryString.parse(query);
        if(tokens.oauth_token){
            getEncryptedData(twitDataLoc, (err, data) => {
                if(err) throw err;
                let dat = JSON.parse(data);
                dat.verifier = tokens.oauth_verifier;
                let send = JSON.stringify(dat)
                setEncryptedData(twitDataLoc, send, (err) => {
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
            if(browser) browser.close();
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
        event.sender.send('send-reg-list', {"list": list});
    });
}
ipcMain.on('get-reg-list', getRegList);


// Twitter API data ------------------------------------------------------------ Twitter API data

let twitterCon = '0IxvGU3ZW5ui4WOOSns1aBCYf';
let twitterConSec = 'T2YUYViTBCUPWkmtVBLSvm15BTF6H4Pd9gvvr4PihSuJKV88Ub';

var twitter = new twitterAPI({
    consumerKey: twitterCon,
    consumerSecret: twitterConSec,
    callback: 'http://localhost:8888/twitterauth'
});

function checkTwitterConfig(){
    // Twitter data json init
	fs.access(twitDataLoc, fs.constants.F_OK, (err) => {
		if (err) {
			let twitData = {
				consumer_key: twitterCon,
				consumer_secret: twitterConSec,
				request_token: '',
				request_secret: '',
				verifier: '',
				access_token: '',
				access_secret: ''
			}
			var dat = JSON.stringify(twitData);
			setEncryptedData(twitDataLoc, dat, (err) => {
				if (err) {
					console.log(err);
					fs.unlink(twitDataLoc, (err) => {
						if (err) throw err;
						console.log('Removed the file I just tried to make.');
					});
					throw err;
                    return;
				}
				console.log('Made the new file')
			});
		}
		console.log('Twitter Data file found! Loading now...');

		getEncryptedData(twitDataLoc, (err, data) => {
            if(err) throw err;
			if (data.access_token && data.access_secret) {
				connectTwitter();
			}
		});
	});
}

ipcMain.on('make-data-twch', mkTwitchCfg);

ipcMain.on('get-twi-keys', (event) => {
    getEncryptedData(twitDataLoc, (err, dat) => {
        if(err) throw err;
        let parsedDat = JSON.parse(dat);
        // twitter = new twitterAPI({
        //     consumerKey: parsedDat.consumer_key,
        //     consumerSecret: parsedDat.consumer_secret,
        //     callback: 'http://localhost:8888/twitterauth'
        // });
        console.log('Twitter Bot Primed.');
    });
});

function getTwitData(event, arg) {
    getEncryptedData(twitDataLoc, (err, decryptedDat) => {
        if(err) throw err;
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
    setEncryptedData(twitDataLoc, arg.config, (err) => {
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
                console.log(dat);
                console.log('I am sending the twitter config');
                event.sender.send('send-access_token-twit', dat);
                dat = JSON.stringify(dat);
                setEncryptedData(twitDataLoc, dat, (err) => {
                    if(err) throw err;
                });
            }});
        }
    });
});


function getTwitAccessTokens(){
    getEncryptedData(twitDataLoc, (err, data) => {
        let dat = JSON.parse(data);
        if(err) return console.log(err);
        twitter.getAccessToken(dat.request_token, dat.request_secret, dat.verifier, (err, accessToken, accessSecret, results) => {
            if(err) return console.log(err);
            dat.access_token = accessToken;
            dat.access_secret = accessSecret;
            setEncryptedData(twitDataLoc, JSON.stringify(dat), (err) => {
                if(err) throw err;
                console.log('Saved twitter auth.');
                if(browser) browser.close();

                connectTwitter();
            });
        });
    });
}

function clearTwitterData(event){
    var twitData = {
        consumer_key:     twitterCon,
        consumer_secret:  twitterConSec,
        request_token:    '',
        request_secret:   '',
        verifier:         '',
        access_token:     '',
        access_secret:    ''
    }
    let dat = JSON.stringify(twitData);
    setEncryptedData(twitDataLoc, dat, (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('Twitter Data Reset')
    })
}
ipcMain.on('clearTwitterAuth', clearTwitterData);
ipcMain.on('reset-twit-data', clearTwitterData);

function connectTwitter(event){
    getEncryptedData(twitDataLoc, (err, dat) => {
        let data = JSON.parse(dat);
        console.log(data);

        if(err){
            dialog.showErrorBox('Twitter Auth Failed', "The Twitter authentication failed.\nReason: " + err.message);
            return console.log(err);
        }
        else{
            // console.log(data.consumer_key+" " + data.consumer_secret+" " + data.access_token+" " + data.access_secret);
            T = new twit({
                consumer_key:         data.consumer_key,
                consumer_secret:      data.consumer_secret,
                access_token:         data.access_token,
                access_token_secret:  data.access_secret
            });
            T.get('account/verify_credentials', {
                skip_status: true
            }).catch( (err) => {
                if(err){
                    dialog.showErrorBox('Twitter Auth Failed', "The Twitter authentication failed.\nReason: " + err.message);
                    if(event || typeof event === "object") event.sender.send('twit-authed', false);
                    console.log(err);
                }
            }).then( (result) => {
                console.log('I logged into the Twitter account of: ' + result.data['screen_name']);

                if(event || typeof event === "object") {

                    console.log('sending true...');
                    event.sender.send('twit-authed', true);
                    event.sender.send('finished-twit-auth');
                }
                else{
                    dialog.showMessageBox({
                        type: 'info',
                        buttons: ["OK"],
                        message: `Glyph Code Grabber successfully connected to the ${result.data['screen_name']} Twitter account. You can now giveaway codes on your twitter!`,
                        title: 'Twitter Connection Success!'
                    }, (res) => {

                    });
                }
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
            console.log('codes posted successfully!');
            dialog.showMessageBox({
                type: 'info',
                buttons: ["OK"],
                message: 'Your code(s) were posted to your Twitter account!',
                title: 'Giveaway Successful...'
            }, (res) => {

            });
            console.log(data);
            event.sender.send('twitter-posted-data', data);
        }

    });
}
ipcMain.on('twitter-post', twitterPost);

// FOR TWITCH.TV ---------------------------------------------------------------
function getTwitchCfg(event, arg){
    getEncryptedData(twchDataLoc, (err, dat) => {
        if(err) throw err;
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
    getEncryptedData(disDataLoc, (err, dat) => {
        if(err) throw err;
        event.sender.send( 'loaded-data-dis', dat);
        console.log('Loaded Discord Data!');
    });
});

function mkDiscordCfc(){
    let discord_config = {
        "client_id":     undefined,
        "token":         undefined,
        "sub_role":      undefined,
        "time_as_sub":   undefined,
        "options": {
            "del_comm":  false,
            "auto_conn": false
        }
    };
    fs.access(disDataLoc, fs.constants.F_OK, (err) => {
        if(err){
            fs.writeFile(disDataLoc, discord_config, (err) =>{
                if(err) throw err;
            });
        }
        else{
            console.log('Discord data file found!');
        }
    });
}

ipcMain.on('addUserToDict', (event, arg) => {
    AssignCodes.addUserToDict(arg.user, arg.code, assignedCodesLoc, (err, code) => {
        if(err){
            event.sender.send('addedUserToDict', {
                "found": false,
                "err": err,
                "code": code
            });
        }
        else{
            console.log('Added user to Dict.');
            event.sender.send('addedUserToDict', {
                "found": true,
                "err": undefined,
                "code": undefined
            });
        }
    });
});
ipcMain.on('checkUserDict', (event, arg) => {
    AssignCodes.checkUserDict(arg.user, assignedCodesLoc, (err, code) => {
        if(err){
            event.sender.send('checkedUserDict', {
                "found": false,
                "err": err,
                "code": code
            });
        }
        else{
            console.log('Added user to Dict.');
            event.sender.send('checkedUserDict', {
                "found": false,
                "err": undefined,
                "code": undefined
            });
        }
    });
});
ipcMain.on('clearAssignedCodes', (event, arg) => {
    AssignCodes.clearAssignedCodes(assignedCodesLoc, (err, code) => {
        if(err){
            event.sender.send('clearedAssignedCodes', false);
        }
        else{
            console.log('Added user to Dict.');
            event.sender.send('clearedAssignedCodes', true);
        }
    });
});



// FOR Sheets API -----------------------------------------------------


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];


// Load client secrets from a local file and encrypt them.

// Authorize a client with credentials, then call the Google Sheets API.
function mkGsheetsCred(){
    fs.access(sheetsDataLoc, fs.constants.F_OK, (err) => {
        if(err){
            console.log(err);
            var credentials = {
            	"installed": {
            		"client_id": "1022617838269-4u3v74c1qnccs2ctvqd70duskmh3338e.apps.googleusercontent.com",
            		"project_id": "glyph-code-grabb-1534541097751",
            		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
            		"token_uri": "https://www.googleapis.com/oauth2/v3/token",
            		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            		"client_secret": "H8VwEABAP8ROL5ALiEEq_Tmo",
            		"redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost:8888/sheets-passport"]
            	}
            }
            setEncryptedData(sheetsDataLoc, JSON.stringify(credentials), (err) => {
                if(err) return console.log(err);
                else{
                    console.log('Created the sheets data.');
                    // sheetsAuthorize(JSON.parse(content), pullFromSheet);
                    // getSheetsConfig();
                }
            });
        }
        else{
            console.log('Found Google Sheets App Credentials...');
        }
    });
}

var oAuth2Client;
const sheetsOauthLoc = `${__dirname}\\bin\\gs_oAuth2.dat`;

function getSheetsConfig(callback){
    getEncryptedData(sheetsDataLoc, (err, content) => {
        if(err) return mkGsheetsCred();
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
        if (err) console.log('Sheets OAuth was not authed yet.');
    })
}
ipcMain.on('clear-gsheets-token', clearGSheetsToken);

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function pullFromSheet(event, arg) {
    getEncryptedData(sheetsOauthLoc, (err, content) => {
        if(err) throw err;
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
ipcMain.on('gsheets-extract', pullFromSheet);



// FOR StreamLabs API -----------------------------------------------------
//
const StreamLabsApi = require('../backend_modules/StreamLabs.js');

var StreamLabs = new StreamLabsApi('DGORvSSFwNgOg0Qpg7xacw8R1ENvSBG555hGD8lA', 'bNeFZxfGsSoa3pjIyI0WMIfyH1OIxqCuxZyCybe6', 'http://localhost:8888/streamlabsauth', 'donations.read donations.create alerts.create socket.token points.read points.write');

ipcMain.on('slAuth', (event, data) => {
    slInit();
    let slAuthUrl = StreamLabs.authorizationUrl();
    console.log(StreamLabs);
    newWebView(undefined, {
        url: slAuthUrl
    });
});

function slInit(runAnyway){
    let slData = {
        clientId : 'DGORvSSFwNgOg0Qpg7xacw8R1ENvSBG555hGD8lA',
        clientSecret : 'bNeFZxfGsSoa3pjIyI0WMIfyH1OIxqCuxZyCybe6',
        redirectUrl : 'http://localhost:8888/streamlabsauth',
        scope : 'donations.read donations.create alerts.create socket.token points.read points.write',
        userTokens : {}
    }

    checkFile(slDataLoc, (err) => {
        if(err || runAnyway){
            setEncryptedData(slDataLoc, JSON.stringify(slData), (err) => {
                if(err) throw err;
            });
        }
    })
}
// slInit();

function slAuthCont(code){
    StreamLabs.connect(code)
    .then( (tokenData)=> {
        getEncryptedData(slDataLoc, (err, data) => {
            var dataFile = JSON.parse(data);
            dataFile.userTokens = tokenData.data;
            setEncryptedData(slDataLoc, JSON.stringify(dataFile), (err) => {
                if(err) throw err;
                else{

                }
            });
        });

    })
    .catch((err) => {
        console.error(err);
    });
}

function slReauth(){
    getEncryptedData(slDataLoc, (err, data) => {
        if(err) throw err;
        else{
            var tokenData = JSON.parse(data);
            StreamLabs.reconnect(tokenData.userTokens.refresh_token);
        }
    })
}
