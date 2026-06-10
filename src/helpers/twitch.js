let twitchChannel, username, accessToken;

/** this might not be a const!! 
 * in fact, it's probably a function. generateClient(accessToken).
 */
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
 * posts in the twitch chat. just shortening some of the 
 * lines in main.js
 * @param {string} message 
 */
const postInChat = (message) => {
    client.say(`#${twitchChannel}`, message);
}