// const fs = require('fs')
// const config = require('config.json')
const ConfigParser = require('configparser')
const path = require('path')
const tmi = require('tmi.js')

const mod = require('./tools/mod')
const dbd = require('./tools/voting/voting')

const conf = new ConfigParser()
conf.read(path.resolve(__dirname, './../../keys/config.ini'))

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

client.on('message', (channel, user, message, self) => {
    if (self) return
    if (!message) return
    if (message.charAt(0) !== prefix) return
    
    // vote
    if (message.startsWith(prefix + 'vote')) {
        const voteReply = dbd.store(message, user)
        console.log(voteReply)
        client.say(channel, voteReply)
    }
    else if (message.startsWith(prefix + 'myvote')) {
        console.log('my vote')
        const myVoteReply = dbd.myVote(user)
        client.say(channel, myVoteReply)
    }
    
    // mod only commands
    if (mod.isMod(user)) {
        // clear votes
        if (message.startsWith(prefix + 'clear')) {
            const clearReply = dbd.clear()
            client.say(channel, clearReply)
        }
        // list votes
        if (message.startsWith(prefix + 'listvotes') || message.startsWith(prefix + 'list votes')) {
            const listReply = dbd.listVotes()
            client.say(channel, listReply)
        }
        // possibly announce?

        
    }
})