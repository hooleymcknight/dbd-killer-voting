const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer, nativeImage } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const tmi = require('tmi.js');