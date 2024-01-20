import * as React from 'react';
import * as ReactDOM from 'react-dom';
const path = window.require('path');

const AnnounceView = (props) => {
    const [winner, setWinner] = React.useState({});

    const backToMain = () => {
        props.onBack();
    }

    const announceWinner = (e) => {
        const killer = e.target.closest('.winner-select').querySelector('select').value;
        const winningViewer = props.data[killer].length ? props.data[killer] : ':('
        setWinner({"killer": killer, "viewer": winningViewer});
        props.onWinner(winningViewer);
    }

    return (
        <>
            <button id="back" type="button" onClick={backToMain}>←</button>
            <h1>{props.aggro ? 'Tell Them Bitches Who Won' : 'Announce a Winner'}</h1>

            <div className="winner-select">
                <select defaultValue="">
                    <option disabled value="">{props.aggro ? 'Who\'s stabbing you?' : 'Select the killer'}</option>
                    {Object.keys(props.data).map(x =>
                        <option key={x} value={x}>{x} </option>
                    )}
                </select>
                <button id="submitWinner" onClick={(e) => announceWinner(e)}>
                    {props.aggro ? 'Boom.' : 'Sumbit'}
                </button>
                
            </div>

            <p className="winning-viewer">{winner.viewer}</p>
        </>
    );
}

export default AnnounceView;