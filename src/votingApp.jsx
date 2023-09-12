import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MainView from './components/mainView.jsx';
import EditView from './components/EditView.jsx';
import ReconnectView from './components/ReconnectView.jsx';
const path = window.require('path');
const ipcRenderer = window.require('electron').ipcRenderer;

ipcRenderer.on('testEvent', (event, data) => {
    console.log('test event received');
    if (data) console.log(data);
});

// ipcRenderer.on('darkModeToggle', (event, data) => {
//     if (data) {
//         document.documentElement.classList.add('dark-mode');
//     }
//     else {
//         document.documentElement.classList.remove('dark-mode');
//     }
// });

const VotingApp = () => {
    const [killerNicknames, setKillerNicknames] = React.useState({});
    const [isEditing, setIsEditing] = React.useState(false);
    const [isReconnecting, setIsReconnecting] = React.useState(false);

    ipcRenderer.on('editModeToggle', (event, data) => {
        setKillerNicknames(data[1]);
        setIsEditing(data[0]);
    });

    ipcRenderer.on('reconnectTwitch', (event, data) => {
        setIsReconnecting(true);
    });

    ipcRenderer.on('editComplete', (event, data) => {
        setKillerNicknames(data);
        setIsEditing(true);
    });

    const sendOauthToken = (token) => {
        ipcRenderer.send('updateOauth', token);
        setIsReconnecting(false);
    }

    const changeNicknames = (nicknameData) => {
        ipcRenderer.send('updateNicknames', nicknameData);
    }

    React.useEffect(() => {
        document.documentElement.addEventListener('click', (e) => {
            if (e.target.id === 'clear') {
                ipcRenderer.send('clear');
            }
            else if (e.target.id === 'closeVoting') {
                const closeVotingBtn = document.querySelector('#closeVoting span');
                const state = closeVotingBtn.textContent;
                if (state == 'Close') {
                    closeVotingBtn.innerText = 'Open';
                }
                else {
                    closeVotingBtn.innerText = 'Close';
                }
                ipcRenderer.send('toggleVoting');
            }
        });
    }, []);

    return (
        <>
            <img className="bg-img" src={path.resolve(__dirname, '../../../../../../src/assets/dbd-bg.jpg')}/>
            <main className="voting-app" data-state={ isReconnecting ? 'reconnect' : isEditing ? 'edit' : 'main'}>
                {
                    isReconnecting ? <ReconnectView onReconHandler={(token) => sendOauthToken(token)} onBack={() => setIsReconnecting(false)} /> : isEditing ? <EditView data={killerNicknames} onChangeNicknames={(nicknameData) => changeNicknames(nicknameData)} /> : <MainView />
                }
            </main>
        </>
    );
}

export default VotingApp;