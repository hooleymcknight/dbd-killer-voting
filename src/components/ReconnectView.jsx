import * as React from 'react';
import * as ReactDOM from 'react-dom';
const path = window.require('path');

const ReconnectView = (props) => {

    const reconHandler = (e) => {
        e.preventDefault();
        const token = e.target.previousElementSibling.value;
        props.onReconHandler(token);
    }

    const backToMain = () => {
        props.onBack();
    }

    return (
        <>
            <button id="back" type="button" onClick={backToMain}>←</button>
            <h1>Reconnect to Twitch</h1>
            <img src={path.resolve(__dirname, '../../../../../../src/assets/access_token.png')} alt="access token screenshot" />
            <input type="text" placeholder="access token here"></input>
            <button id="submitAT" type="submit" onClick={(e) => reconHandler(e)}>Reconnect</button>
        </>
    );
}

export default ReconnectView;