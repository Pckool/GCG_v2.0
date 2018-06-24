import { app, autoUpdater, BrowserWindow, ipcMain } from 'electron';
require('electron-debug')();
require('electron-reload')(__dirname);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

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

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
// 	const dialogOpts = {
// 		type: 'info',
// 		buttons: ['Restart', 'Later'],
// 		title: 'Application Update',
// 		message: process.platform === 'win32' ? releaseNotes : releaseName,
// 		detail: 'A new version has been downloaded. Restart the application to apply the updates.'
// 	}
//
// 	dialog.showMessageBox(dialogOpts, (response) => {
// 		if (response === 0) autoUpdater.quitAndInstall()
// 	})
// })
// autoUpdater.on('error', message => {
// 	console.error('There was a problem updating the application')
// 	console.error(message)
// })

// Electron is dev
const isDev = require('electron-is-dev');

if (isDev) {
	console.log('Running in development');
} else {
	console.log('Running in production');
}

// Twitter API data
var Twit = require('twit')

ipcMain.on('get-twi-keys', (event, arg) => {
    console.log('Sending Twitter Bot data...');
    var T = {
      consumer_key:         '0IxvGU3ZW5ui4WOOSns1aBCYf',
      consumer_secret:      'T2YUYViTBCUPWkmtVBLSvm15BTF6H4Pd9gvvr4PihSuJKV88Ub',
      app_only_auth:        true
      // access_token:         '800188803210035200-qD0Q8k68lDcsFOfmkPt48ADrZ5Wc3jT',
      // access_token_secret:  'xd9IZkn9Pvmv5WInYanKih1YQGk2xAYqqZ5R5QWRnYi92'
    };
    event.sender.send('send-twi-keys', T);
});


ipcMain.on('load-page', (event, arg) => {
    mainWindow.loadURL(arg);
});
