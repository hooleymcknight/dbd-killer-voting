import * as React from 'react';
import * as ReactDOM from 'react-dom';
const path = window.require('path');

const SetupView = (props) => {

    const setupHandler = (e) => {
        e.preventDefault();
        const clientId = e.target.parentElement.querySelector('#clientId').value;
        const username = e.target.parentElement.querySelector('#username').value;
        const setupAlert = e.target.closest('.setup-section').querySelector('.setup-alert');

        if (!clientId || !username) {
            if (setupAlert) {
                e.target.closest('[data-aggro="true"]') ? setupAlert.innerText = '...I need info??' : setupAlert.innerText = 'Please enter both your client ID and your username';
                setupAlert.classList.remove('hidden');
                setTimeout(() => {
                    setupAlert.classList.add('hidden');
                }, 6000);
            }
        }
        else {
            if (setupAlert) {
                e.target.closest('[data-aggro="true"]') ? setupAlert.innerText = 'I need your SSN too /j' : setupAlert.innerText = 'Submitted!';
                setupAlert.classList.remove('hidden');
                setTimeout(() => {
                    setupAlert.classList.add('hidden');
                }, 6000);
            }
            props.onSetupHandler({ clientId: clientId, username: username });
        }
    }

    const backToMain = () => {
        props.onBack();
    }

    return (
        <>
            <button id="back" type="button" onClick={backToMain}>←</button>
            <div className="setup-section">
                <h1>{props.aggro ? 'Get Your Shit Together' : 'Set Up Twitch'}</h1>
                <input id="clientId" type="text" placeholder="client id here"></input>
                <input id="username" type="text" placeholder="bot username here"></input>
                <button id="submitSetup" type="submit" onClick={(e) => setupHandler(e)}>{props.aggro ? 'Save Your Shit' : 'Submit'}</button>
                <p className="setup-alert hidden"></p>
            </div>
        </>
    );
}

export default SetupView;