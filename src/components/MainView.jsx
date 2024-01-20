import * as React from 'react';
import * as ReactDOM from 'react-dom';

const MainView = (props) => {

    return (
        <>
            <h1>DBD Killer Voting</h1>
            <button id="clear" onClick={() => props.clear()}>{props.aggro ? 'Throw Away Votes' : 'Clear Votes'}</button>
            <button id="closeVoting" onClick={() => props.toggle(props.voting)}>
                <span>
                    {props.voting ? (props.aggro ? 'No More' : 'Close') : (props.aggro ? 'Let People' : 'Open')}
                </span> {props.aggro ? 'Vote' : 'Voting'}
            </button>
            <button id="listvotes" onClick={() => props.listVotes()}>List</button>
            <button id="announce" onClick={() => props.announce()}>Announce</button>
        </>
    );
}

export default MainView;