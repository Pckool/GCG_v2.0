import { app, autoUpdater, BrowserWindow, ipcMain } from 'electron';
require('electron-debug')();
require('electron-reload')(__dirname);
var http = require('http');
var fs = require('fs');
var url = require('url');
var mime = require('mime');
var path = require('path');
var queryString = require('query-string');

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
		backgroundColor: '#3B414F',
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
    fs.access(`${__dirname}/bin/tw.dat`, fs.constants.F_OK, (err) => {
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
            fs.writeFile(`${__dirname}/bin/tw.dat`, JSON.stringify(twitData), (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log('Made the new file')
            });
            return;
        }
        console.log('Twitter Data file found! Loading now...');
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

// For Updating
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

// Localized Server
function handleRequest(req, res) {
	var file = path.join(app.getAppPath(), req.url);
    let query = req.url.substr(1);
    console.log(queryString.parse(query));
    var tokens = queryString.parse(query);
    if(tokens.oauth_token){
        fs.readFile(`${__dirname}/bin/tw.dat`, (err, data) => {
            let dat = JSON.parse(data);
            dat.verifier = tokens.oauth_verifier;
            fs.writeFile(`${__dirname}/bin/tw.dat`, dat, (err) => {
                if(err) throw err;
                console.log('Saved Twitter Data... Proceeding to final step.');
            });
        });
    }

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
		res.write('404 Not Found. But the server exists!');
		res.end();
	});
}
var server = http.createServer(handleRequest);
server.listen(8888, function() {
	console.log('server started at http://localhost:8888');
});

// Twitter API data
const TwitterApi = require('node-twitter-signin');

ipcMain.on('get-twi-keys', (event, arg) => {
    fs.readFile(`${__dirname}/bin/tw.dat`, (err, data) => {
        let dat = JSON.parse(data);
        console.log('Sending Twitter Bot data...');
        var T = {
          consumer_key:         dat.consumer_key,
          consumer_secret:      dat.consumer_secret,
          app_only_auth:        true
        };
        event.sender.send('send-twi-keys', T);
    });
});

ipcMain.on('load-page', (event, arg) => {
    child = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        show: false,
        width: 710,
        height: 530,
        autoHideMenuBar: true,
        alwaysOnTop: true
    });
    child.loadURL('https://twitter.com/oauth/authenticate?oauth_token=' + arg);
    child.once('ready-to-show', () => {
        mainWindow.setEnabled(false);
        child.show();
    });

    child.on('closed', () => {
        mainWindow.setEnabled(true);
    });
    event.sender.send('loaded-page', child);
});

ipcMain.on('open-login', (event, arg) => {
    // const oauth = require('oauth-electron-twitter').oauth;
    // const twitter = require('oauth-electron-twitter').twitter;
    // var auth = new oauth();
    // let keys = auth.login(arg, child);
    // event.sender.send('store-keys', keys);

});
