const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer, nativeImage } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const tmi = require('tmi.js');
const dbd = require('./tools/voting/voting');
// importing some reconnect stuff.

const config = require('./helpers/config.json');

const { store, template, base64icon,
    checkForFile, checkAllKTFs, fallbackKTF
} = require('./helpers/helpers');

const TWITCH_CHANNEL = 'videovomit';

let mainWindow, client;
/*
    declared in previous version:
    clientId, oauthCode, refreshToken, accessToken, username
*/
const twitchChannel = `#${TWITCH_CHANNEL}`;