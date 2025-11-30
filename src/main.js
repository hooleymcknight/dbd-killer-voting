const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const ConfigParser = require('configparser');
const tmi = require('tmi.js');

const mod = require('./tools/mod');
const dbd = require('./tools/voting/voting');

const { template, store, killerTextFile } = require('./helpers/helpers.js');
const { clear } = require('console');

let mainWindow;
let client;
let oauth = store.get('oauth');
let clientId = store.get('clientId');
let username = store.get('username');

const twitchChannel = '#hollyngrade'; // #videovomit, needs the hashtag bc that is how twitch reads shit

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
    
    if (store.get('localMods') == null) {
        store.set('localMods', [{"username":"videovomit","id":"72383101"}]);
    }

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
        // icon: path.join(__dirname, 'assets/icons/png/56x56.png'),
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
            mainWindow.webContents.send('changeState', ['startSetup']);
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
    channels: [twitchChannel.replace('#','')]
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

// const checkIfMod = (user) => {
//     if ((modType === 'twitch' && user.badges?.moderator) || (modType === 'local' && mod.isMod(user))) {
//         return true
//     }
//     return false;
// }

connectToTwitch();

client.on('message', async (channel, user, message, self) => {
    if (self) return;
    if (!message) return;
    if (message.charAt(0) !== prefix) return;

    // vote
    if (message.toLowerCase().startsWith(prefix + 'vote')) {
        if (votingClosed) {
        client.say(channel, 'Voting is currently closed.');
        return;
        }
        const voteReply = await dbd.storeVote(message, user);
        client.say(channel, voteReply);
    }
    else if (message.toLowerCase().startsWith(prefix + 'myvote')) { // who did I vote for
        const myVoteReply = await dbd.myVote(user);
        client.say(channel, myVoteReply);
    }
    else if (message.toLowerCase().startsWith(prefix + 'help')) { // command list
        const helpCommands = dbd.help(mod.isMod(user));
        client.say(channel, helpCommands);
    }
    // list votes
    else if (message.toLowerCase().startsWith(prefix + 'listvotes') || message.toLowerCase().startsWith(prefix + 'list votes')) {
        const listReply = await dbd.listVotes();
        client.say(channel, listReply);
    }
    
    // mod only commands
    // if (checkIfMod(user)) {
    //     // clear votes
    //     if (message.toLowerCase().startsWith(prefix + 'clear')) {
    //         const clearReply = await dbd.clear();
    //         store.set('previousRound', clearReply[1]);
    //         client.say(channel, clearReply[0]);
    //     }
    //     // possibly announce?

    //     // close voting
    //     else if (message.toLowerCase().startsWith(prefix + 'close') || message.toLowerCase().startsWith(prefix + 'closevoting') || message.toLowerCase().startsWith(prefix + 'close voting')) {
    //         votingClosed = true;
    //         mainWindow.webContents.send('votingToggledManually', false); // false == voting closed, in the mainwindow
    //         client.say(channel, 'Voting is now closed.');
    //     }
    //     else if (message.toLowerCase().startsWith(prefix + 'open') || message.toLowerCase().startsWith(prefix + 'openvoting') || message.toLowerCase().startsWith(prefix + 'open voting')) {
    //         votingClosed = false;
    //         mainWindow.webContents.send('votingToggledManually', true); // true == voting open, in the mainWindow
    //         client.say(channel, 'Voting has been opened.');
    //     }
    // }
});

// =====================================
// ===================================== IPC MAIN =====================================
// =====================================

ipcMain.on('clear', async () => {
    const clearReply = await dbd.clear();
    store.set('previousRound', clearReply[1]);
    client.say(twitchChannel, clearReply[0]);
});

ipcMain.on('undoClear', async () => {
    const undoClearReply = await dbd.undoClear(store.get('previousRound'));
    client.say(twitchChannel, undoClearReply);
})

ipcMain.on('listvotes', async () => {
    const listReply = await dbd.listVotes();
    client.say(twitchChannel, listReply);
});

ipcMain.on('toggleVoting', async (event, data) => {
    if (data) {
        votingClosed = false;
        client.say(twitchChannel, 'Voting has been opened.');
    }
    else {
        votingClosed = true;
        client.say(twitchChannel, 'Voting is now closed.');
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
        mainWindow.webContents.send('changeState', ['goToMain']);
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
        channels: ['videovomit']
    });
    client.connect().catch(() => {
        
        mainWindow.webContents.on('did-finish-load', async () => {
            const { shell } = require('electron');
            await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
            mainWindow.webContents.send('changeState', ['reconnectTwitch', true]);
        });
    });
});

ipcMain.on('updateNicknames', (event, data) => {
    const killerToEdit = data.killer;
    const newNicknames = data.nicknames;
    let currentNicknames = store.get('killerNicknames');
    currentNicknames[killerToEdit] = newNicknames;
    store.set('killerNicknames', currentNicknames);
    mainWindow.webContents.send('changeState', ['editComplete', currentNicknames]);
});

const addNewKillerName = async (newName, originalName) => {
    // update the voting blank killers list (json)
    let killerBlank = store.get('killerBlank');

    // need to capitalize the first letter of the new killer name, otherwise it won't sort right.
    let capitalizedData = newName.charAt(0).toUpperCase() + newName.substr(1, newName.length - 1);
    killerBlank[capitalizedData] = "";

    if (originalName) {
        delete killerBlank[originalName];
    }

    let keys = Object.keys(killerBlank).sort();
    let sortedKillerBlank = {};
    keys.forEach((key) => {
        sortedKillerBlank[key] = '';
    });
    
    store.set('killerBlank', sortedKillerBlank);
    store.set('previousRound', sortedKillerBlank);

    // update the killer nicknames json object in store
    let killerNicknames = store.get('killerNicknames');
    if (!originalName) { // not a name change, so no nicknames to transfer
        killerNicknames[capitalizedData] = [];
    }
    else {
        let currentNicknames = killerNicknames[originalName];
        killerNicknames[capitalizedData] = currentNicknames;
        delete killerNicknames[originalName];
    }

    store.set('killerNicknames', killerNicknames);

    // update the display .txt file
    await fs.writeFile(killerTextFile, dbd.createTxtFile(sortedKillerBlank));
}

ipcMain.on('addNewKiller', (event, data) => {
    addNewKillerName(data)
    mainWindow.webContents.send('addComplete', true);
});

// ipcRenderer.send('change-killer-main-name', document.querySelector('#change-killer-name').value);
ipcMain.on('change-killer-main-name', (event, data) => {
    console.log('received new killer main name...', data[1]);
    const originalName = data[0];
    const newName = data[1];

    addNewKillerName(newName, originalName);

    // Prepare for relaunch
    app.relaunch();
    // Quit the current instance, triggering the relaunch
    app.exit()
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

ipcMain.on('setAnnounceMode', async () => {
    const votesObject = await dbd.sendVotesObject();
    mainWindow.webContents.send('announceWinner', votesObject);
});

ipcMain.on('postWinner', (event, data) => {
    const winningViewer = data;
    if (data != ':(') {
        client.say(twitchChannel, `Congratulations @${data}!! You win a steam game!`);
    }
    else {
        client.say(twitchChannel, 'There\s no winner this time. :(');
    }
});

ipcMain.on('requestLocalMods', () => {
    mainWindow.webContents.send('localMods', [store.get('localMods'), clientId, oauth]);
});

ipcMain.on('addNewMod', (event, data) => {
    let currentMods = store.get('localMods');

    if (!currentMods.filter(x => x.username === data.username).length) {
        currentMods.push(data);
    }

    let newMods = [...new Set(currentMods)];
    store.set('localMods', newMods);
    mainWindow.webContents.send('localMods', [newMods]);
});

ipcMain.on('removeMod', (event, data) => {
    let currentMods = store.get('localMods');
    let idxToRemove = currentMods.indexOf(currentMods.filter(x => x.username == data)[0]);
    let newMods = [...currentMods];
    newMods.splice(idxToRemove, 1);
    store.set('localMods', newMods);
    mainWindow.webContents.send('localMods', [newMods]);
});

module.exports = { clientId };