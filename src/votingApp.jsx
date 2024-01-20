import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MainView from './components/MainView.jsx';
import EditView from './components/EditView.jsx';
import ReconnectView from './components/ReconnectView.jsx';
import SetupView from './components/SetupView.jsx';
const path = window.require('path');
const ipcRenderer = window.require('electron').ipcRenderer;

const VotingApp = () => {
    const [killerNicknames, setKillerNicknames] = React.useState({});
    const [struckKillers, setstruckKillers] = React.useState(false);
    const [aggroMode, setAggroMode] = React.useState(false);
    const [previousState, setPreviousState] = React.useState('main');
    const [state, setState] = React.useState('main');
    const [votingState, setVotingState] = React.useState(false); // false == closed, true == open

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

    React.useEffect(() => {
        const toggleVoting = (e) => {
            let openText = 'Open';
            let closeText = 'Close';
            if (e.target.closest('[data-aggro="true"]')) {
                openText = 'Let People';
                closeText = 'No More';
            }

            if (e.target.closest('#clear')) {
                ipcRenderer.send('clear');
            }
            else if (e.target.closest('#closeVoting')) {
                const closeVotingBtn = document.querySelector('#closeVoting span');
                const txtVotingState = closeVotingBtn.textContent;
        
                if (txtVotingState == 'Close' || txtVotingState == 'No More') {
                    closeVotingBtn.innerText = openText;
                    setVotingState(true);
                    ipcRenderer.send('toggleVoting', true);
                }
                else {
                    closeVotingBtn.innerText = closeText;
                    setVotingState(false);
                    ipcRenderer.send('toggleVoting', false);
                }
            }
        }

        document.documentElement.addEventListener('click', toggleVoting);

        document.documentElement.addEventListener('keyup', (e) => {
            console.log('keyup')
            if (e.target.closest('input') && e.key === 'Enter') {
                console.log('enter in input')
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
                :
                    <MainView
                        voting={votingState}
                        aggro={aggroMode}
                    />
                }
            </main>
        </>
    );
}

export default VotingApp;