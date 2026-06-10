const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer, nativeImage, safeStorage } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const tmi = require('tmi.js');
// const dbd = require('./tools/voting/voting');
const { loadTokens, saveTokens } = require('./helpers/tokens');
// importing some reconnect stuff.
const { start } = require('./helpers/auth');

// const config = require('./helpers/config.json');

// const { store, template, base64icon,
//     checkForFile, checkAllKTFs, fallbackKTF
//     // make one function somewhere else to spit all this KTF shit out as one variable
// } = require('./helpers/helpers');

const TWITCH_CHANNEL = 'videovomit';

let mainWindow, client;
/*
    declared in previous version:
    clientId, oauthCode, refreshToken, accessToken, username
*/
const twitchChannel = `#${TWITCH_CHANNEL}`;

start();

/*

NORMAL FLOW STEPS (starter flow in parenthesis):

0 - pull all info from safe storage.

1 - check for secret. (and AT, RT)
1.5 - fetch secret if needed. (or start the auth code flow)

2 - check AT expiry
2.5 - REQUEST new AT from Twitch using RT.

3 - use the AT in twitch.js to generateClient(AT) then client.connect.

*/