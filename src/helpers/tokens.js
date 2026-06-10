/*

NORMAL FLOW STEPS (starter flow in parenthesis):

0 - pull all info from safe storage.

1 - check for secret. (and AT, RT)
1.5 - fetch secret if needed. (or start the auth code flow)

2 - check AT expiry
2.5 - REQUEST new AT from Twitch using RT.

3 - use the AT in twitch.js to generateClient(AT) then client.connect.

*/

const { safeStorage } = require('electron');
const { store } = require('./helpers');

// NOTE!! safe storage is not the locker. store is.
// safe storage encrypts it before you put it in the locker.

export const saveTokens = (tokens) => {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('no OS secret store');
    const blob = safeStorage.encryptString(JSON.stringify(tokens));
    // store.set('tokens', blob.toString('latin1')); // store ciphertext, not plaintext
    console.log('tokens:', blob.toString('latin1'))
}

export const loadTokens = () => {
    const raw = store.get('tokens');
    if (!raw) return null;
    return JSON.parse(safeStorage.decryptString(Buffer.from(raw, 'latin1')));
}

/*

in our safe storage, we MUST have the CLIENT SECRET. 
we cannot refresh any tokens without that. we don't ship with the secret.

if we don't have the secret, then we need to go ahead and ping my server--
even if we arent about to *use* the secret, that's fine. but we need it.

----> we have the secret.
okay, cool. so now we're gonna look in safe storage for our AT and expiry.
it's probably expired but that's fine, check anyway.
>> if we dont have the ACCESS TOKEN in safe storage, then 

*/