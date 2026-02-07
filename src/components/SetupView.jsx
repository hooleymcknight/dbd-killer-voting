import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import { useState, useEffect } from 'react';

const ipcRenderer = window.require('electron').ipcRenderer;

const SetupView = (props) => {
    const [username, setUsername] = React.useState('');
    const [oauth, setOauth] = React.useState('');

    const setupHandler = (e) => {
        e.preventDefault();
        const oauthCode = e.target.parentElement.querySelector('#oauthCode').value;
        const username = e.target.parentElement.querySelector('#username').value;
        const setupAlert = e.target.closest('.setup-section').querySelector('.setup-alert');

        if (!oauthCode || !username) {
            if (setupAlert) {
                setupAlert.innerText = 'Please enter both your username and the oauth code.';
                setupAlert.classList.remove('hidden');
                setTimeout(() => {
                    setupAlert.classList.add('hidden');
                }, 6000);
            }
        }
        else {
            if (setupAlert) {
                setupAlert.innerText = 'Submitted!';
                setupAlert.classList.remove('hidden');
                setTimeout(() => {
                    setupAlert.classList.add('hidden');
                }, 6000);
            }
            props.onSetupHandler({ oauthCode: oauthCode, username: username });
        }
    }

    const backToMain = () => {
        props.onBack();
    }

    React.useEffect(() => {
        if (!oauth.length && !username.length) {
            ipcRenderer.send('startSetup');
        }

        ipcRenderer.on('sendSetupData', (event, data) => {
            if (!oauth.length && data.oauth?.length) {
                setOauth(data.oauth);
            }
            if (!username.length && data.username?.length) {
                setUsername(data.username);
            }
        });
    }, []);

    return (
        <>
            <button id="back" type="button" onClick={backToMain}>←</button>
            <div className="setup-section">
                <h1>Set Up Twitch</h1>
                <input id="oauthCode" type="text" placeholder="oauth code here" defaultValue={oauth}></input>
                <input id="username" type="text" placeholder="bot username here" defaultValue={username}></input>
                <button id="submitSetup" type="submit" onClick={(e) => setupHandler(e)}>Submit</button>
                <p className="setup-alert hidden"></p>
            </div>
        </>
    );
}

export default SetupView;