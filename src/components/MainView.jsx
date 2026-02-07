import * as React from 'react';
import * as ReactDOM from 'react-dom';
const ipcRenderer = window.require('electron').ipcRenderer;

const MainView = (props) => {

    ipcRenderer.on('undoClear', (event, data) => {
        ipcRenderer.send('undoClear', {});
    });

    return (
        <>
            <h1>DBD Killer Voting</h1>
            <button id="clear" onClick={() => props.clear()}>{props.aggro ? 'Throw Away Votes' : 'Clear Votes'}</button>
            <button id="closeVoting" onClick={() => props.toggle(props.voting)}>
                <span>
                    {props.voting ? 'Close' : 'Open'}
                </span> Voting
            </button>
            <button id="listvotes" onClick={() => props.listVotes()}>List</button>
        </>
    );
}

export default MainView;