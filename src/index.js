const ConfigParser = require('configparser');
const tmi = require('tmi.js');
const fetch = require('node-fetch');

const mod = require('./tools/mod');
const dbd = require('./tools/voting/voting');

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      resizable: false,
      icon: __dirname + '/assets/dbd-perk.png',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      }
    });
  
    win.loadFile('./src/index.html');
}

app.whenReady().then(() => {
    createWindow();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})

// =================== bot functions

const conf = new ConfigParser();
conf.read(path.resolve(__dirname, '../keys/config.ini'));

conf.sections();

const prefix = '!';

fetch(`https://id.twitch.tv/oauth2/token?client_id=${conf.get('TWITCH', 'client_id')}&client_secret=${conf.get('TWITCH', 'client_secret')}&response_type=token&grant_type=client_credentials`, {
    method: 'POST'
})
.then(res => res.json())
.then(res => {
    const token = res.access_token
    console.log('token', token)

    let votingClosed = false;

    const client = new tmi.client({
        options: { debug: false },
        connection: {
            secure: true,
            reconnect: true
        },
        identity: {
            username: conf.get('TWITCH', 'username'),
            password: `oauth:${token}`
        },
        channels: ['hooleymcknight', 'videovomit']
    });

    client.connect();

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
            const voteReply = await dbd.store(message, user);
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
    })

    ipcMain.on('clear', async () => {
        const clearReply = await dbd.clear();
        client.say('#videovomit', clearReply);
    })

    ipcMain.on('toggleVoting', async () => {
        if (votingClosed) {
            votingClosed = false;
            client.say('#videovomit', 'Voting has been opened.');
        }
        else {
            votingClosed = true;
            client.say('#videovomit', 'Voting is now closed.');
        }
    })
})



