const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const ConfigParser = require('configparser');
const tmi = require('tmi.js');

const mod = require('./tools/mod');
const dbd = require('./tools/voting/voting');

const { template, store, killerTextFile } = require('./helpers/helpers.js');

let mainWindow;
let client;
let oauth = store.get('oauth');
let clientId = store.get('clientId');
let username = store.get('username');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = () => {
  let { width, height } = store.get('windowBounds');
  let x = store.get('windowPosition')?.x;
  let y = store.get('windowPosition')?.y;

  // let settings = {
  //   width,
  //   height,
  //   // icon: 'https://raw.githubusercontent.com/hooleymcknight/dbd-killer-voting/main/src/assets/dbd-perk.png', // path.join(__dirname + './../../src/assets/dbd-perk.png'),
  //   webPreferences: {
  //     webSecurity: false,
  //     nodeIntegration: true,
  //     nodeIntegrationInSubFrames: true,
  //     nodeIntegrationInWorker: true,
  //     contextIsolation: false,
  //     // preload: path.join(__dirname + './../../src/preload.js'),
  //   }
  // };

  // if (x) {
  //   settings.x = x;
  //   settings.y = y;
  // }

  if (!x || !y) {
    x = 100;
    y = 100;
  }

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    // icon: 'C:/Users/Hooley/Downloads/dbd-perk_56.ico',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      // preload: path.join(__dirname + './../../src/preload.js'),
    }
  });

  // mainWindow.setIcon('C:/Users/Hooley/Downloads/dbd-perk_56.ico');

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.webContents.on('did-finish-load', async () => {
    if (store.get('aggroMode')) {
      mainWindow.webContents.send('aggroModeToggle', true);
    }
    if (!clientId || !username) {
      mainWindow.webContents.send('startSetup', true);
    }
    else if(!oauth || !oauth.length) {
      mainWindow.webContents.send('reconnectTwitch');
      const { shell } = require('electron');
      await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
    }
  });

  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('moved', () => {
    const [ x, y ] = mainWindow.getPosition();
    store.set('windowPosition', { x, y });
  });

  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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

// =====================================
// ===================================== TWITCH BOT =====================================
// =====================================

const prefix = '!';
// const clientId = '4lkkme3giuv2145v3t2uq1mfgdcop7'

let votingClosed = false;

client = new tmi.client({
  options: { debug: false },
  connection: {
    secure: true,
    reconnect: true
  },
  identity: {
    username: username,
    password: `oauth:${oauth}`
  },
  channels: ['hooleymcknight', 'videovomit']
});

const connectToTwitch = () => {
  if (!mainWindow) {
    setTimeout(connectToTwitch, 100);
    return;
  }

  client.connect().catch(() => {
    mainWindow.webContents.on('did-finish-load', async () => {
      if (clientId) {
        const { shell } = require('electron');
        await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
        mainWindow.webContents.send('reconnectTwitch', true);
      }
      else {
        setTimeout(connectToTwitch, 500);
      }
    });
  });
}

connectToTwitch();

client.on('message', async (channel, user, message, self) => {
  if (self) return;
  if (!message) return;
  if (message.charAt(0) !== prefix) return;
  
  // vote
  if (message.startsWith(prefix + 'vote')) {
    if (votingClosed) {
      client.say(channel, 'Voting is currently closed.');
      return;
    }
    const voteReply = await dbd.storeVote(message, user);
    client.say(channel, voteReply);
  }
  else if (message.startsWith(prefix + 'myvote')) { // who did I vote for
    const myVoteReply = await dbd.myVote(user);
    client.say(channel, myVoteReply);
  }
  else if (message.startsWith(prefix + 'help')) { // command list
    const helpCommands = dbd.help(mod.isMod(user));
    client.say(channel, helpCommands);
  }
  // list votes
  else if (message.startsWith(prefix + 'listvotes') || message.startsWith(prefix + 'list votes')) {
    const listReply = await dbd.listVotes();
    client.say(channel, listReply);
  }
  
  // mod only commands
  if (mod.isMod(user)) {
      // clear votes
    if (message.startsWith(prefix + 'clear')) {
      const clearReply = await dbd.clear();
      client.say(channel, clearReply);
    }
    // possibly announce?

    // close voting
    else if (message.startsWith(prefix + 'close') || message.startsWith(prefix + 'closevoting') || message.startsWith(prefix + 'close voting')) {
      votingClosed = true;
      mainWindow.webContents.send('votingToggledManually', false); // false == voting closed, in the mainwindow
      client.say(channel, 'Voting is now closed.');
    }
    else if (message.startsWith(prefix + 'open') || message.startsWith(prefix + 'openvoting') || message.startsWith(prefix + 'open voting')) {
      votingClosed = false;
      mainWindow.webContents.send('votingToggledManually', true); // true == voting open, in the mainWindow
      client.say(channel, 'Voting has been opened.');
    }
  }
});

// =====================================
// ===================================== IPC MAIN =====================================
// =====================================

ipcMain.on('clear', async () => {
  const clearReply = await dbd.clear();
  client.say('#videovomit', clearReply);
});

ipcMain.on('toggleVoting', async (event, data) => {
  if (data) {
    votingClosed = false;
    client.say('#videovomit', 'Voting has been opened.');
  }
  else {
    votingClosed = true;
    client.say('#videovomit', 'Voting is now closed.');
  }
});

ipcMain.on('requestEdit', (event, data) => {
  event.reply('sendEditState', store.get('editMode'));
});

ipcMain.on('updateSetup', async (event, data) => { // data: { clientId: clientId, username: username }
  clientId = data.clientId;
  store.set('clientId', clientId);
  username = data.username;
  store.set('username', username);

  if (oauth && oauth.length) {
    mainWindow.webContents.send('goToMain');
  }
  else {
    const { shell } = require('electron');
    await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
    mainWindow.webContents.send('reconnectTwitch', true);
  }
});

ipcMain.on('updateOauth', (event, data) => {
  oauth = data;
  store.set('oauth', oauth);
  client = new tmi.client({
    options: { debug: false },
    connection: {
      secure: true,
      reconnect: true
    },
    identity: {
      username: username, // conf.get('TWITCH', 'username'),
      password: `oauth:${oauth}`
    },
    channels: ['hooleymcknight', 'videovomit']
  });
  client.connect().catch(() => {
    
    mainWindow.webContents.on('did-finish-load', async () => {
      const { shell } = require('electron');
      await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
      mainWindow.webContents.send('reconnectTwitch', true);
    });
  });
});

ipcMain.on('updateNicknames', (event, data) => {
  const killerToEdit = data.killer;
  const newNicknames = data.nicknames;
  let currentNicknames = store.get('killerNicknames');
  currentNicknames[killerToEdit] = newNicknames;
  store.set('killerNicknames', currentNicknames);
  mainWindow.webContents.send('editComplete', currentNicknames);
});

ipcMain.on('addNewKiller', async (event, data) => {
  // update the voting blank killers list (json)
  let killerBlank = store.get('killerBlank');

  // need to capitalize the first letter of the new killer name, otherwise it won't sort right.
  let capitalizedData = data.charAt(0).toUpperCase() + data.substr(1, data.length - 1);
  killerBlank[capitalizedData] = "";

  let keys = Object.keys(killerBlank).sort();
  let sortedKillerBlank = {};
  keys.forEach((key) => {
    sortedKillerBlank[key] = '';
  });
  
  store.set('killerBlank', sortedKillerBlank);

  // update the killer nicknames json
  let killerNicknames = store.get('killerNicknames');
  killerNicknames[capitalizedData] = [];
  store.set('killerNicknames', killerNicknames);

  // update the display .txt file
  await fs.writeFile(killerTextFile, dbd.createTxtFile(sortedKillerBlank));
  mainWindow.webContents.send('addComplete', true);
});

ipcMain.on('changeStrike', (event, data) => {
  const killer = data[0];
  const strike = data[1];
  let struckKillers = store.get('struckKillers');
  if (strike && !struckKillers.includes(killer)) {
    struckKillers.push(killer);
    store.set('struckKillers', struckKillers);
  }
  else if(!strike && struckKillers.includes(killer)) {
    let newStruck = [];
    struckKillers.forEach((struck) => {
      if (killer != struck) newStruck.push(struck);
    });
    store.set('struckKillers', newStruck);
  }
});

module.exports = { clientId };