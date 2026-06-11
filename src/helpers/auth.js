// start auth here
const { loadTokens, saveTokens } = require('./tokens');
/**
 * shape of tokens:
 *  tokens: { 
        access:       { value: 'at-code', expiry: '12345' }, // we are given expiry in the response
        refresh:      { value: 'rt-code', expiry: '123456123' }, // we will create expiry. set to 30 days.
        authCode:     { value: 'oauth-code' }, // one-time use!
        clientSecret: { value: 'secret-code-from-hg-server' },
    }
 */

    /***
     * scrap all this, ugh. client is not allowed to go through the app even with safestorage.
     * access and refresh through app. maybe auth code but idk. it's one time use actually so no.
     * secret must live on the server. the server will communicate with twitch on the app's behalf.
     */

export const start = () => {
    
    // STEP 0 ----------------
    const existingTokens = loadTokens();
    
    // STEP 1 -----------------
    const clientSecret = existingTokens.clientSecret || await fetchSecret();

    // STEP 2 ------------------
    const accessToken = await getAccessToken(existingTokens.access, existingTokens.refresh);

    //
}

const getAccessToken = async (access = null, refresh = null) => {
    if (access?.value && !isExpired(access.expiry)) return access.value;
    if (refresh?.value && !isExpired(refresh.expiry)) return await refreshAccessToken(refresh.value);
    return await startAuthCodeFlow();
}; // functions I need to write: refreshAccessToken && startAuthCodeFlow && fetchSecret

const fetchSecret = async () => {
    fetch('https://hollyngrade.com/')
}

/*

NORMAL FLOW STEPS (starter flow in parenthesis):

0 - pull all token info from the store.

1 - check for secret. (and AT, RT)
1.5 - fetch secret if needed. (or start the auth code flow) --> does the auth code flow lead back in to fetch secret? these could be independent of each other actually...

2 - check AT expiry
2.5 - REQUEST new AT from Twitch using RT.

3 - use the AT in twitch.js to generateClient(AT) then client.connect.

*/


/**
 * we've pulled the tokens object info from the store, and we want to check 
 * some token's expiry. this function will work on whatever. we're just
 * lookin at dates for this.
 * @param {Date} expireDT 
 */
const isExpired = (expireDT) => {
    if (!expireDT) return false;
    return (new Date() > expireDT);
}
// well, this function was much fucking shorter than I expected it to be.

// when you SET expiry, it needs to get set as...
/*
    given: 14127 --> seconds until AT expires.
    grab this datetime.
    let expiresAt = new Date();
    expiresAt = expiresAt.setMilliseconds(expiresAt.getMilliseconds())
    let expireDT = new Date(expiresAt + (givenExpirySec * 1000))

    we should do this last line in the checkExpiry function, of course.
    if (new Date() < expireDT) not expired! you can use this.
*/



/* 
realistically, the first thing I should do is check cache/storage
for accesstoken.
--> if I have one, I can try it out. 
    // jk, no-- I will store expiry date. check that.
--> --> I'm in? sweet.
--> --> no good? let's check out our options.

if I have a refresh token that isn't expired, I should use it.

....

access tokens die after 4 hours, so when we store them, 
let's store them with an expiry date. then we can check
that, rather than bothering to try an AT that might be
very expired.

...where is it that I think I'm gonna safely store any 
cache on an electron app?
if I store it on my server that could be safe in theory,
but what would be the point-- it would take a fetch
to get it. I might as well just fetch w/ my refresh token.
wait... lol where am I storing the refresh token?

okay maybe both are stored on the server, I fetch them,
and then I look at what I have, and make a decision 
based on that data, where I should fetch next:
- refresh the access token (RT valid, AT expired)
- start the oauth flow (RT and AT both expired)

okay, so RTs expire after 30 days. I likely won't hit 
this bc when I get a new AT, I'll get a new RT,
but I should store an RT expiry regardless to
save me a fetch.

OKAY let's talk about security.
user logs into twitch, passes code to app.
App passes code to twitch, trades for tokens.
We store tokens on the server and in the store, but bcrypt them up first.

*/

const scope = 'channel:moderate+chat:edit+chat:read';
const redirectUri = 'https://hollymphillips.com/projects/guess-the-killer/api:3001'

const connectUrl = `https://id.twitch.tv/oauth2/authorize?client_id=CLIENTID&redirect_uri=REDIRECTURI&response_type=code&scope=${scope}`