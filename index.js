const ConfigParser = require('configparser')
const tmi = require('tmi.js')

const mod = require('./src/tools/mod')
const dbd = require('./src/tools/voting/voting')

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const createWindow = () => {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      icon: __dirname + '/assets/dbd-perk.png',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: false,
      }
    })
  
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// =================== bot functions

const conf = new ConfigParser()
conf.read(path.resolve(__dirname, './keys/config.ini'))

conf.sections()

const prefix = '!'

const client = new tmi.client({
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: conf.get('TWITCH', 'username'),
        password: conf.get('TWITCH', 'TWITCH_OAUTH_TOKEN')
    },
    channels: ['hooleymcknight', 'videovomit']
})

client.connect()

client.on('message', async (channel, user, message, self) => {
    if (self) return
    if (!message) return
    console.log(channel)
    if (message.charAt(0) !== prefix) return
    
    // vote
    if (message.startsWith(prefix + 'vote')) {
        const voteReply = await dbd.store(message, user)
        client.say(channel, voteReply)
    }
    else if (message.startsWith(prefix + 'myvote')) {
        const myVoteReply = await dbd.myVote(user)
        client.say(channel, myVoteReply)
    }
    
    // mod only commands
    if (mod.isMod(user)) {
        // clear votes
        if (message.startsWith(prefix + 'clear')) {
            const clearReply = await dbd.clear()
            client.say(channel, clearReply)
        }
        // list votes
        if (message.startsWith(prefix + 'listvotes') || message.startsWith(prefix + 'list votes')) {
            const listReply = await dbd.listVotes()
            client.say(channel, listReply)
        }
        // possibly announce?

        
    }
})

ipcMain.on('click', async () => {
    const clearReply = await dbd.clear()
    client.say('#videovomit', clearReply)
})