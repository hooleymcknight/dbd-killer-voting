import * as React from 'react';
const path = window.require('path');
const axios = require('axios');
const ipcRenderer = window.require('electron').ipcRenderer;

const EditModsView = (props) => {
    const [localMods, setLocalMods] = React.useState([]);
    const [authInfo, setAuthInfo] = React.useState({ clientId: '', oauth: ''});
    const [modsRequested, setModsRequested] = React.useState(false);

    ipcRenderer.on('localMods', (event, data) => {
        if (data.length > 1) {
            setAuthInfo({ clientId: data[1], oauth: data[2]});
        }
        setLocalMods(data[0]);
    });

    const backToMain = () => {
        props.onBack();
    }

    const addNewMod = (e) => {
        const input = e.target.closest('.new-mod').querySelector('input[name="add-mod"]');
        let username = input.value.replace('@','');
        if (username.length) {
            axios.get(`https://api.twitch.tv/helix/users?login=${username}`, {
                headers: {
                    'Client-Id': authInfo.clientId,
                    'Authorization': `Bearer ${authInfo.oauth}`
                }
            }).then((res) => {
                const userInfo = res.data.data[0];
                input.value = '';

                let newLocalMods = [...localMods];
                newLocalMods.push({ "username": userInfo.login, "id": userInfo.id });
                setLocalMods(newLocalMods);

                ipcRenderer.send('addNewMod', { "username": userInfo.login, "id": userInfo.id });
            }).catch((err) => {
                window.alert('Oops, error! Try again.');
            });
        }
    }

    const removeMod = (e) => {
        let username = e.target.closest('.existing-mod').dataset.username;
        ipcRenderer.send('removeMod', username);

        let newLocalMods = [...localMods];
        let idxToRemove = newLocalMods.indexOf(newLocalMods.filter(x => x.username === username)[0]);
        newLocalMods.splice(idxToRemove, 1);
        setLocalMods(newLocalMods);
    }

    React.useEffect(() => {
        if (!localMods?.length && !modsRequested) {
            ipcRenderer.send('requestLocalMods');
            setModsRequested(true);
        }
    }, [localMods]);

    return (
        <>
            <button id="back" type="button" onClick={backToMain}>←</button>
            <h1>{props.aggro ? 'here a mod, there a mod, everywhere a mod mod' : 'Edit Mods'}</h1>

            <div className="edit-mods-section">
                {localMods?.length ? 
                    localMods.map(x => 
                        <div key={x.id} className="existing-mod" data-username={x.username}>
                            <p>{x.username}</p>
                            <button type="button" onClick={(e) => removeMod(e)}>-</button>
                        </div>
                    )
                : ''}
                <div className="new-mod">
                    <input type="text" name="add-mod" placeholder="new mod username"></input>
                    <button type="button" onClick={(e) => addNewMod(e)}>+</button>
                </div>
            </div>
        </>
    );
}

export default EditModsView;