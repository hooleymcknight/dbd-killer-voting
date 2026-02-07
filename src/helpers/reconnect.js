const { shell } = require('electron');
const config = require('./config.json');

const getOauthCode = () => { // returned error: error=access_denied
    shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${config.twitch.clientId}&force_verify=false&redirect_uri=http://localhost:3000&response_type=code&scope=channel:moderate+chat:edit+chat:read`);
}

const getAccessToken = (oauthCode, refreshToken) => {
    console.log('get access token with:', refreshToken ? 'refresh token' : 'oauth');
    return new Promise((resolve, reject) => {
        let params = {
            "client_id": config.twitch.clientId,
            "client_secret": config.twitch.clientSecret,
        }
        if (!refreshToken) {
            params.code = oauthCode;
            params['grant_type'] = 'authorization_code';
            params['redirect_uri'] = 'http://localhost:3000';
        }
        else {
            params['grant_type'] = 'refresh_token';
            params['refresh_token'] = refreshToken;
        }

        // console.log(params);

        fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(params)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error || (data.status && data.status != 200)) {
                console.log('data error');
                console.log(data);
                reject(data);
            }
            else {
                console.log('resolve data')

                // if we succeed here, we will always be given a new access token, and a (possibly new) refresh token.
                // always save both.
                resolve(data);
            }
        })
        .catch((err) => {
            console.error('Error fetching access token:', err);
            reject(err);
        });
    });
}

export { getAccessToken, getOauthCode };