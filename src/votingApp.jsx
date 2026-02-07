import * as React from 'react';
import MainView from './components/MainView.jsx';
import EditView from './components/EditView.jsx';
import SetupView from './components/SetupView.jsx';

const path = window.require('path');
const ipcRenderer = window.require('electron').ipcRenderer;

const VotingApp = () => {
    const [state, setState] = React.useState('main');
    const [previousState, setPreviousState] = React.useState('main');

    const [killerNicknames, setKillerNicknames] = React.useState({});
    const [struckKillers, setstruckKillers] = React.useState(false);
    
    const [votingState, setVotingState] = React.useState(false); // false == closed, true == open
    const [votesObject, setVotesObject] = React.useState({});

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

    ipcRenderer.on('changeState', (event, data) => {
        switch(data[0]) {
            case 'editComplete':
                setKillerNicknames(data[1]);
                if (state !== 'edit') setPreviousState(state);
                setState('edit');
                break;
            case 'startSetup':
                if (state !== 'setup') setPreviousState(state);
                setState('setup');
                break;
            case 'goToMain':
            default:
                // setPreviousState(state); // might work this in someday, I think I could use this to combine 'editModeToggle' into this switch
                setState('main');
                break;
        }
    });

    ipcRenderer.on('announceWinner', (event, data) => {
        setVotesObject(data);
    });

    const goBack = (prevState) => {
        state == prevState ? setState('main') : setState(prevState);
    }

    const toggleVoting = (newVotingState) => {
        if (newVotingState == false) {
            setVotingState(true);
            ipcRenderer.send('toggleVoting', true);
        }
        else {
            setVotingState(false);
            ipcRenderer.send('toggleVoting', false);
        }
    }

    React.useEffect(() => {

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
            <img className="bg-img" src="https://raw.githubusercontent.com/hooleymcknight/dbd-killer-voting/main/src/assets/dbd-bg.jpg" alt="ghostface standing over a guy he stabbed" />
            <main className="voting-app" data-state={state}>
                {
                state == 'setup' ?
                    <SetupView
                        onSetupHandler={(setupData) => ipcRenderer.send('updateSetup', setupData)}
                        onBack={() => goBack(previousState)}
                    />
                : state == 'edit' ?
                    <EditView
                        data={{nicknames: killerNicknames, struck: struckKillers}}
                        onChangeNicknames={(nicknameData) => ipcRenderer.send('updateNicknames', nicknameData)}
                        onAddKiller={(newKillerName) => ipcRenderer.send('addNewKiller', newKillerName)}
                        onBack={() => goBack(previousState)}
                        onStrike={(killer) => ipcRenderer.send('changeStrike', [killer, true])}
                        onUnstrike={(killer) => ipcRenderer.send('changeStrike', [killer, false])}
                    />
                :
                    <MainView
                        voting={votingState}
                        toggle={(newVotingState) => toggleVoting(newVotingState)}
                        clear={() => ipcRenderer.send('clear')}
                        listVotes={() => ipcRenderer.send('listvotes')}
                    />
                }
            </main>
        </>
    );
}

export default VotingApp;