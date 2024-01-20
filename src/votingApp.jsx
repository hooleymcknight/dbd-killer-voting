import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MainView from './components/MainView.jsx';
import EditView from './components/EditView.jsx';
import ReconnectView from './components/ReconnectView.jsx';
import SetupView from './components/SetupView.jsx';
import AnnounceView from './components/AnnounceView.jsx';

const path = window.require('path');
const ipcRenderer = window.require('electron').ipcRenderer;

const VotingApp = () => {
    const [killerNicknames, setKillerNicknames] = React.useState({});
    const [struckKillers, setstruckKillers] = React.useState(false);
    const [aggroMode, setAggroMode] = React.useState(false);
    const [previousState, setPreviousState] = React.useState('main');
    const [state, setState] = React.useState('main');
    const [votingState, setVotingState] = React.useState(false); // false == closed, true == open
    const [votesObject, setVotesObject] = React.useState({});

    ipcRenderer.on('aggroModeToggle', (event, data) => {
        setAggroMode(data);
    });

    ipcRenderer.on('votingToggledManually', (event, data) => {
        setVotingState(data);
    });

    ipcRenderer.on('editModeToggle', (event, data) => {
        setstruckKillers(data[1].struck);
        setKillerNicknames(data[1].nicknames);

        let originalPreviousState;
        previousState == 'edit' ? originalPreviousState = 'main' : originalPreviousState = previousState;
        !data[0] ? setPreviousState('main') : setPreviousState(state);
        data[0] ? setState('edit') : setState(originalPreviousState);
    });

    ipcRenderer.on('goToMain', (event, data) => {
        setState('main');
    })

    ipcRenderer.on('startSetup', (event, data) => {
        if (state !== 'setup') setPreviousState(state);
        setState('setup');
    });

    ipcRenderer.on('reconnectTwitch', (event, data) => {
        if (state !== 'reconnect') setPreviousState(state);
        setState('reconnect');
    });

    ipcRenderer.on('editComplete', (event, data) => {
        setKillerNicknames(data);
        if (state !== 'edit') setPreviousState(state);
        setState('edit');
    });

    ipcRenderer.on('announceWinner', (event, data) => {
        setVotesObject(data);
    });

    const sendOauthToken = (token) => {
        ipcRenderer.send('updateOauth', token);
        setState(previousState);
    }

    const sendSetupData = (setupData) => {
        ipcRenderer.send('updateSetup', setupData);
    }

    const changeNicknames = (nicknameData) => {
        ipcRenderer.send('updateNicknames', nicknameData);
    }

    const addNewKiller = (newKillerName) => {
        ipcRenderer.send('addNewKiller', newKillerName);
    }

    const changeStrike = (killer, strike) => {
        ipcRenderer.send('changeStrike', [killer, strike]);
    }

    const goBack = (prevState) => {
        state == prevState ? setState('main') : setState(prevState);
    }

    const clear = () => {
        ipcRenderer.send('clear');
    }

    const listVotes = () => {
        ipcRenderer.send('listvotes');
    }

    const toggleVoting = (newVotingState) => {
        let openText = 'Open';
        let closeText = 'Close';
        if (aggroMode) {
            openText = 'Let People';
            closeText = 'No More';
        }

        if (newVotingState == false) {
            setVotingState(true);
            ipcRenderer.send('toggleVoting', true);
        }
        else {
            setVotingState(false);
            ipcRenderer.send('toggleVoting', false);
        }
    }

    const goToAnnounceMode = () => {
        setState('announce');
        ipcRenderer.send('setAnnounceMode');
    }

    const postWinner = (winningViewer) => {
        ipcRenderer.send('postWinner', winningViewer);
    }

    React.useEffect(() => {
        

        // document.documentElement.addEventListener('click', () => { toggleVoting(); });

        document.documentElement.addEventListener('keyup', (e) => {
            if (e.target.closest('input') && e.key === 'Enter') {
                if (e.target.type === 'text' && e.target.nextElementSibling.type === 'text') {
                    e.target.nextElementSibling.focus();
                }
                else if (e.target.nextElementSibling.type === 'submit' || e.target.nextElementSibling.type === 'button') {
                    e.target.nextElementSibling.click();
                }
            }
        });

        document.documentElement.addEventListener('change', (e) => {
            if (!e.target.closest('.nickname-inputs')) return;

            if (!e.target.value.length && document.querySelectorAll('.nickname-inputs input[value=""]:not(.removed)').length > 1) {
                e.target.classList.add('removed');
                e.target.disabled = true;
            }
        });
    }, []);

    return (
        <>
            {/* <img className="bg-img" src={path.resolve(__dirname, '../../../../../../src/assets/dbd-bg.jpg')}/> */}
            <img className="bg-img" src="https://raw.githubusercontent.com/hooleymcknight/dbd-killer-voting/main/src/assets/dbd-bg.jpg" alt="ghostface standing over a guy he stabbed" />
            <main className="voting-app" data-state={state} data-aggro={aggroMode}>
                {
                state == 'setup' ?
                    <SetupView
                        onSetupHandler={(setupData) => sendSetupData(setupData)}
                        onBack={() => goBack(previousState)}
                        aggro={aggroMode}
                    />
                : state == 'reconnect' ?
                    <ReconnectView
                        onReconHandler={(token) => sendOauthToken(token)}
                        onBack={() => goBack(previousState)}
                        aggro={aggroMode}
                    />
                : state == 'edit' ?
                    <EditView
                        data={{nicknames: killerNicknames, struck: struckKillers}}
                        onChangeNicknames={(nicknameData) => changeNicknames(nicknameData)}
                        onAddKiller={(newKillerName) => addNewKiller(newKillerName)}
                        onBack={() => goBack(previousState)}
                        onStrike={(killer) => changeStrike(killer, true)}
                        onUnstrike={(killer) => changeStrike(killer, false)}
                        aggro={aggroMode}
                    />
                : state == 'announce' ?
                    <AnnounceView
                        onBack={() => goBack(previousState)}
                        aggro={aggroMode}
                        data={votesObject}
                        onWinner={(winningViewer) => postWinner(winningViewer)}
                    />
                :
                    <MainView
                        voting={votingState}
                        aggro={aggroMode}
                        toggle={(newVotingState) => toggleVoting(newVotingState)}
                        clear={() => clear()}
                        listVotes={() => listVotes()}
                        announce={() => goToAnnounceMode()}
                    />
                }
            </main>
        </>
    );
}

export default VotingApp;