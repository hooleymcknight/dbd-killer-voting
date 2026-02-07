const { app, BrowserWindow, ipcMain, Menu, Tray, ipcRenderer, nativeImage } = require('electron');
const fs = require('fs').promises;
const path = require('path');

const tmi = require('tmi.js');
const dbd = require('./tools/voting/voting');
const { getAccessToken, getOauthCode } = require('./helpers/reconnect.js');

const config = require('./helpers/config.json');

const { template, store, killerTextFile, base64icon } = require('./helpers/helpers.js');
const { clear } = require('console');

let mainWindow;
let client;
let clientId = config.twitch.clientId;
let oauthCode = store.get('oauthCode');
let refreshToken = store.get('refreshToken');
let accessToken = store.get('accessToken');
let username = store.get('username');

const twitchChannel = '#videovomit'; // #videovomit, needs the hashtag bc that is how twitch reads shit

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

    if (!x || !y) {
        x = 100;
        y = 100;
    }

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

    /**
     * on load, see if we have all our setup ready. If not, direct user to the oauth and setup pages.
     * or fetch the new tokens for them.
     */
    mainWindow.webContents.on('did-finish-load', async () => {
        if (!username || !oauthCode) {
            mainWindow.webContents.send('changeState', ['startSetup']);
            if (!oauthCode) {console.log('missing un or oc'); getOauthCode();}
        }
        // else if(!accessToken || !accessToken.length) {
        //     console.log('get access token from main window load in')
        //     getAccessToken(oauthCode)
        //     .then((data) => {
        //         updateTokens(data);
        //     })
        //     .catch((errData) => {
        //         //
        //     });
        // }
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

    const icon = nativeImage.createFromDataURL(base64icon);

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
let votingClosed = false;

client = new tmi.client({
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: username,
        password: `oauth:${accessToken}`
    },
    channels: [twitchChannel.replace('#','')]
});

const updateTokens = (data) => {
    const at = data['access_token'] || '';
    accessToken = at;
    store.set('accessToken', at);

    const rt = data['refresh_token'] || '';
    refreshToken = rt;
    store.set('refreshToken', rt);
}

/**
 * CONNECT TO TWITCH
 * This is the single place where we will know if the AT needs refreshed.
 */
const connectToTwitch = () => {
    if (!mainWindow) {
        setTimeout(connectToTwitch, 100);
        return;
    }

    client.connect()
    .catch(() => { // this is if the access token does not work.
        mainWindow.webContents.on('did-finish-load', async () => {
            // get access token
            if (refreshToken && refreshToken.length) {
                console.log('refresh token')
                getAccessToken(oauthCode, refreshToken)
                .then((data) => {
                    updateTokens(data);
                    connectToTwitch();
                }) // ================ start here.
                /**
                 * you are trying to figure out what to do if you had a refresh token but for some reason didn't get back an AT.
                 * was the RT invalid? something else? look at the errdata.
                 */
                .catch((errData) => { // this will give data back to us! we should analyze it to decide what the best next move is.
                    if (errData.message === 'Invalid refresh token') {
                        // use the oauth code instead to get an AT and RT.
                        console.log('invalid rt')
                        getAccessToken(oauthCode)
                        .then((data) => {
                            updateTokens(data);
                        })
                        .catch((errData) => { // this will give data back to us! we should analyze it to decide what the best next move is.
                            console.error(errData.message);
                            mainWindow.webContents.send('changeState', ['startSetup']);
                            console.log('connect to twitch, catch, get at catch')
                            getOauthCode();
                        });
                    }
                    else {
                        console.error(errData.message);
                        mainWindow.webContents.send('changeState', ['startSetup']);
                        console.log('connect to twitch, catch, valid refresh token')
                        getOauthCode();
                    }
                });
            }
            else if (oauthCode && oauthCode.length) {
                console.log('oauth', oauthCode)
                getAccessToken(oauthCode)
                .then((data) => {
                    console.log('update tokens from data:', data);
                    updateTokens(data);
                })
                .catch((errData) => { // this will give data back to us! we should analyze it to decide what the best next move is.
                    console.error(errData.message); // if the code doesn't work, we should probably redirect to go get a new one.
                    mainWindow.webContents.send('changeState', ['startSetup']);
                    console.log('conn twitch, catch, no rt. get at with oautch, catch.')
                    getOauthCode();
                });
            }
            else {
                console.log('go get oauth code')
                mainWindow.webContents.send('changeState', ['startSetup']);
                console.log('conn twitch, catc, no rt and no oauth.')
                getOauthCode();
            }
        });
    });
}

connectToTwitch();

client.on('message', async (channel, user, message, self) => {
    if (self) return;
    if (!message) return;
    if (message.charAt(0) !== prefix) return;

    let firstMessage = message.toLowerCase().split(' ')[0].replace(prefix, '');

    switch (firstMessage) {
        case "vote":
            if (votingClosed) {
                client.say(channel, 'Voting is currently closed.');
                return;
            }
            const voteReply = await dbd.storeVote(message, user);
            client.say(channel, voteReply);
            break;

        case "myvote":
            const myVoteReply = await dbd.myVote(user);
            client.say(channel, myVoteReply);
            break;

        case "help":
            const helpCommands = dbd.help();
            client.say(channel, helpCommands);
            break;

        case "listvotes":
            const listReply = await dbd.listVotes();
            client.say(channel, listReply);
            break;
    }
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
});

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

ipcMain.on('startSetup', (event, data) => {
    const setupData = {
        oauth: store.get('oauthCode'),
        username: store.get('username'),
    }
    mainWindow.webContents.send('sendSetupData', setupData);
});

ipcMain.on('updateSetup', async (event, data) => { // data: { oauthCode, username }
    oauthCode = data.oauthCode;
    store.set('oauthCode', oauthCode);
    username = data.username;
    store.set('username', username);

    // OAUTH
    if (accessToken && accessToken.length) {
        mainWindow.webContents.send('changeState', ['goToMain']);
    }
    else {
        connectToTwitch();
    }
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

ipcMain.on('change-killer-main-name', (event, data) => {
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