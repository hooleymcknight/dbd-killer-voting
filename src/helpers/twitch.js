let twitchChannel, username, accessToken;

const client = new tmi.client({
    options: { debug: false },
    connection: {
        secure: true,
        reconnect: true
    },
    identity: {
        username: username,
        password: `oauth:${accessToken}`
    },
    channels: [twitchChannel]
});



/**
 * posts in the witch chat. just shortening some of the 
 * lines in main.js
 * @param {string} message 
 */
const postInChat = (message) => {
    client.say(`#${twitchChannel}`, message);
}