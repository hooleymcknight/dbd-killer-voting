const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer, nativeImage, safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const tmi = require('tmi.js');
// const dbd = require('./tools/voting/voting');
const { loadTokens, saveTokens } = require('./helpers/tokens');
// importing some reconnect stuff.
const { start } = require('./helpers/auth');

// const config = require('./helpers/config.json');

const { store, template, base64icon,
    checkForFile, checkAllKTFs, fallbackKTF
    // make one function somewhere else to spit all this KTF shit out as one variable
} = require('./helpers/helpers');

const TWITCH_CHANNEL = 'videovomit';

let mainWindow, client;
/*
    declared in previous version:
    clientId, oauthCode, refreshToken, accessToken, username
*/
const twitchChannel = `#${TWITCH_CHANNEL}`;

// start();

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

/*

NORMAL FLOW STEPS (starter flow in parenthesis):

0 - pull all info from safe storage.

1 - check for secret. (and AT, RT)
1.5 - fetch secret if needed. (or start the auth code flow)

2 - check AT expiry
2.5 - REQUEST new AT from Twitch using RT.

3 - use the AT in twitch.js to generateClient(AT) then client.connect.

*/

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    let width = 800;
    let height = 600;
    let x, y = 100;

    mainWindow = new BrowserWindow({
        width,
        height,
        x,
        y,
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            // preload: path.join(__dirname + './../../src/preload.js'),
        }
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    mainWindow.webContents.openDevTools();

    return mainWindow;
}

app.on('ready', () => {
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow();
    }
});