import * as React from 'react';
import * as ReactDOM from 'react-dom';

const MainView = (props) => {

    return (
        <>
            <h1>DBD Killer Voting</h1>
            <button id="clear">Clear Votes</button>
            <button id="closeVoting"><span>Close</span> Voting</button>
        </>
    );
}

export default MainView;