const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const Store = require('./helpers/store.js');

const ConfigParser = require('configparser');
const tmi = require('tmi.js');

const mod = require('./tools/mod');
const dbd = require('./tools/voting/voting');

const { template, store } = require('./helpers/helpers.js');

let mainWindow;
let client;
let oauth = store.get('oauth');

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

  let settings = {
    width,
    height,
    icon: __dirname + '/assets/dbd-perk.png',
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
      // preload: path.join(__dirname + './../../src/preload.js'),
    }
  };

  if (x) {
    settings.x = x;
    settings.y = y;
  }

  mainWindow = new BrowserWindow(settings);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (store.get('darkMode')) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('darkModeToggle', true);
    });
  }

  if (store.get('editMode')) {
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('editModeToggle', true);
    });
  }

  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store.set('windowBounds', { width, height });
  });

  mainWindow.on('moved', () => {
    const [ x, y ] = mainWindow.getPosition();
    store.set('windowPosition', { x, y });
  });

  mainWindow.webContents.openDevTools();

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on('requestEdit', (event, data) => {
  event.reply('sendEditState', store.get('editMode'));
});

// =================== bot functions

const conf = new ConfigParser();
conf.read(path.resolve(__dirname, '../../keys/config.ini'));
conf.sections();

const prefix = '!';
const clientId = conf.get('TWITCH', 'client_id');

if (!oauth) {
  oauth = '';
  store.set('oauth', oauth);
}

let votingClosed = false;

client = new tmi.client({
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: conf.get('TWITCH', 'username'),
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
      const { shell } = require('electron');
      await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${conf.get('TWITCH', 'client_id')}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
      mainWindow.webContents.send('reconnectTwitch', true);
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
    
    // mod only commands
    if (mod.isMod(user)) {
        // clear votes
        if (message.startsWith(prefix + 'clear')) {
            const clearReply = await dbd.clear();
            client.say(channel, clearReply);
        }
        // list votes
        else if (message.startsWith(prefix + 'listvotes') || message.startsWith(prefix + 'list votes')) {
            const listReply = await dbd.listVotes();
            client.say(channel, listReply);
        }
        // possibly announce?

        // close voting
        else if (message.startsWith(prefix + 'close') || message.startsWith(prefix + 'closevoting') || message.startsWith(prefix + 'close voting')) {
            let votingClosed = true;
            client.say(channel, 'Voting is now closed.');
        }
        else if (message.startsWith(prefix + 'open') || message.startsWith(prefix + 'openvoting') || message.startsWith(prefix + 'open voting')) {
            let votingClosed = false;
            client.say(channel, 'Voting has been opened.');
        }
    }
});

ipcMain.on('clear', async () => {
    const clearReply = await dbd.clear();
    client.say('#videovomit', clearReply);
});

ipcMain.on('toggleVoting', async () => {
    if (votingClosed) {
        votingClosed = false;
        client.say('#videovomit', 'Voting has been opened.');
    }
    else {
        votingClosed = true;
        client.say('#videovomit', 'Voting is now closed.');
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
          username: conf.get('TWITCH', 'username'),
          password: `oauth:${oauth}`
      },
      channels: ['hooleymcknight', 'videovomit']
  });
  client.connect().catch(() => {
    
    mainWindow.webContents.on('did-finish-load', async () => {
      const { shell } = require('electron');
      await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${conf.get('TWITCH', 'client_id')}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
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
  // mainWindow.webContents.send('editModeToggle', true);
})

module.exports = { clientId };