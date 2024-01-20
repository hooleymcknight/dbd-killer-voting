import * as React from 'react';
import * as ReactDOM from 'react-dom';
const ipcRenderer = window.require('electron').ipcRenderer;

let changesSavedTimeout;

const EditView = (props) => {
    const [activeKiller, setActiveKiller] = React.useState('');
    const [activeIsStruck, setActiveIsStruck] = React.useState(props.data.struck.includes(activeKiller) || false);
    const [addingKiller, setAddingKiller] = React.useState(false);

    const backToEdit = () => {
        resetError();
        setAddingKiller(false);
    }

    const backToMain = () => {
        props.onBack();
    }

    const addKiller = (e) => {
        resetError();
        const newKillerName = e.target.previousElementSibling.value;
        if (!newKillerName.length) {
            const addAlertMsg = document.querySelector('.add-complete');
            if (addAlertMsg) {
                document.querySelector('[data-aggro="true"]') ? addAlertMsg.innerText = 'No' : addAlertMsg.innerText = 'Please enter a name';
                addAlertMsg.classList.remove('hidden');
                changesSavedTimeout = setTimeout(() => {
                    addAlertMsg.classList.add('hidden');
                }, 6000);
            }
        }
        else {
            props.onAddKiller(newKillerName);
        }
    }

    const changeActiveKiller = (e) => {
        resetError();
        setActiveKiller(e.target.value);
        setActiveIsStruck(props.data.struck.includes(e.target.value));
    }

    const changeHandler = (e) => {
        console.log('change handler')
        if (!e.target.value.length) {
            e.target.classList.add('removed');
            e.target.disabled = true;
        }
    }

    const addNickname = (e) => {
        e.target.insertAdjacentHTML('beforebegin', `<input type="text" value="" placeholder="Add new nickname"></input>`);
        e.target.closest('.nickname-inputs').querySelector('input:last-of-type').focus();
    }

    const submitChanges = (e) => { // who that bitch be, data
        resetError();
        const newNicknames = Array.from(e.target.parentElement.querySelectorAll('input')).filter(x => x.value.trim().length > 0).map(x => x.value);
        const noDup = new Set(newNicknames);

        if (newNicknames.length !== noDup.size) {
            const alertMsg = document.querySelector('.alert-message');
            if (alertMsg) {
                alertMsg.innerText = 'Duplicate nicknames are confusing';
                alertMsg.classList.remove('hidden');

                changesSavedTimeout = setTimeout(() => {
                    alertMsg.classList.add('hidden');
                }, 6000);
            }
        }
        else {
            props.onChangeNicknames({
                killer: activeKiller,
                nicknames: newNicknames
            });
        }
    }

    const strike = (killer) => {
        resetError();
        props.data.struck.push(killer);
        props.onStrike(killer);
        setActiveIsStruck(true);
    }

    const unstrike = (killer) => {
        resetError();
        let newStruck = [];
        props.data.struck.forEach((struck) => {
            if (killer != struck) newStruck.push(struck);
        });
        props.data.struck = newStruck;

        props.onUnstrike(killer);
        setActiveIsStruck(false);
    }

    const resetError = () => {
        const alertMsg = document.querySelector('.alert-message');
        if (alertMsg) {
            alertMsg.innerText = '';
            alertMsg.classList.add('hidden');
        }
    }

    React.useEffect(() => {
        if (document.querySelector('input.new-input')) {
            document.querySelector('input.new-input').value = '';
        }

        ipcRenderer.on('editComplete', (event, data) => {
            resetError();

            if (document.querySelector('input.new-input')) {
                document.querySelector('input.new-input').value = '';
            }
            
            if (alertMsg) {
                document.querySelector('[data-aggro="true"]') ? alertMsg.innerText = 'Don\'t remember asking but thanks' : alertMsg.innerText = 'Changes saved!'
                alertMsg.classList.remove('hidden');

                changesSavedTimeout = setTimeout(() => {
                    alertMsg.classList.add('hidden');
                }, 6000);
            }
        });

        ipcRenderer.on('addComplete', (event, data) => {
            const addAlertMsg = document.querySelector('.add-complete');
            if (addAlertMsg) {
                document.querySelector('input.new-killer').value = '';
                document.querySelector('[data-aggro="true"]') ? addAlertMsg.innerText = 'Took you long enough' : addAlertMsg.innerText = 'Killer added!';
                addAlertMsg.classList.remove('hidden');
                changesSavedTimeout = setTimeout(() => {
                    addAlertMsg.classList.add('hidden');
                }, 6000);
            }
        });

    }, [activeKiller]);

    return (
        <>
            {addingKiller ?
            <>
                <button id="back" type="button" onClick={backToEdit}>←</button>
                <div className="edit-section">
                    <h1>{props.aggro ? 'Who\'s the New Kid?' : 'Add New Killer'}</h1>
                    <p className="add-warning">WARNING: Doing this will erase all current votes.</p>
                    <input className="new-killer" type="text" defaultValue="" placeholder="Display name"></input>
                    <button type="submit" id="submit-new" onClick={(e) => addKiller(e)}>{props.aggro ? 'Sometime today' : 'Submit Changes'}</button>
                    <p className="add-complete hidden"></p>
                </div>
            </>
            :
            <>
                {/* <button id="back" type="button" onClick={backToMain}>←</button> */}
                <button type="button" id="add-new" onClick={() => {setAddingKiller(true)}}>+</button>
                <h1>{props.aggro ? 'Barbie Dress-Up' : 'Edit Killer'}</h1>
                <select onChange={(e) => changeActiveKiller(e)} defaultValue="">
                    <option disabled value="">{props.aggro ? 'Pick a baddie' : 'Choose a killer'}</option>
                    {Object.keys(props.data.nicknames).map(x =>
                        <option key={x} value={x}>{x} </option>
                    )}
                </select>
                {activeKiller ?
                <>
                    <div className="edit-section">
                        <p>{props.aggro ? 'Who that bitch be?' : 'Killer nicknames:'}</p>
                        <div className="nickname-inputs">
                            {props.data.nicknames[activeKiller].map(x => <input key={x} type="text" defaultValue={x}></input>)}
                            <input className="new-input" type="text" defaultValue="" placeholder={props.aggro ? "Who the fuck are you" : "Add new nickname"} ></input>
                            <button type="button" id="add-nickname" onClick={(e) => addNickname(e)}>+</button>
                        </div>
                        <button type="submit" id="submit-changes" onClick={(e) => submitChanges(e)}>{props.aggro ? 'Get on with it' : 'Submit Changes'}</button>
                        <p className="alert-message hidden"></p>
                    </div>
                    { activeIsStruck ?
                        <button type="button" className="strike-btn" id="unstrike" onClick={() => {unstrike(activeKiller)}}>{props.aggro ? 'Put me in, Coach.' : 'Unstrike'}</button>
                    :
                        <button type="button" className="strike-btn" id="strike" onClick={() => {strike(activeKiller)}}>Strike{props.aggro ? '!!! They out' : ''}</button>
                    }
                </>
                :
                ''
                }
            </>
            }
            
        </>
    );
}

export default EditView;