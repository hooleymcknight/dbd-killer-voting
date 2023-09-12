import * as React from 'react';
import * as ReactDOM from 'react-dom';
const ipcRenderer = window.require('electron').ipcRenderer;

let changesSavedTimeout;

const EditView = (props) => {
    const [activeKiller, setActiveKiller] = React.useState('');

    const changeActiveKiller = (e) => {
        setActiveKiller(e.target.value);
    }

    const changeHandler = (e) => {
        if (!e.target.value.length) {
            e.target.classList.add('removed');
            e.target.disabled = true;
        }
    }

    const addNickname = (e) => {
        e.target.insertAdjacentHTML('beforebegin', `<input type="text" value="" placeholder="Add new"></input>`);
    }

    const submitChanges = (e) => { // who that bitch be, data
        const newNicknames = Array.from(e.target.parentElement.querySelectorAll('input')).filter(x => x.value.trim().length > 0).map(x => x.value);
        const noDup = new Set(newNicknames);

        // if (newNicknames.length !== noDup.length) {
        //     console.log('duplicates')
        // }

        props.onChangeNicknames({
            killer: activeKiller,
            nicknames: newNicknames
        });
    }

    React.useEffect(() => {
        if (document.querySelector('input.new-input')) {
            document.querySelector('input.new-input').value = '';
        }

        const completeEdits = () => {
            
        }

        ipcRenderer.on('editComplete', (event, data) => {
            document.querySelector('.edit-complete').classList.add('hidden');

            if (document.querySelector('input.new-input')) {
                document.querySelector('input.new-input').value = '';
            }
            
            document.querySelector('.edit-complete')?.classList.remove('hidden');
            changesSavedTimeout = setTimeout(() => {
                document.querySelector('.edit-complete')?.classList.add('hidden');
            }, 6000);
        });

    }, [activeKiller])

    return (
        <>
            <h1>Edit View</h1>
            <select onChange={(e) => changeActiveKiller(e)}>
                {Object.keys(props.data).map(x =>
                    <option key={x} value={x}>{x} </option>
                )}
            </select>
            {activeKiller ?
                <div class="edit-section">
                    <p>Killer nicknames:</p>
                    <div className="nickname-inputs">
                        {props.data[activeKiller].map(x => <input key={x} type="text" defaultValue={x} onChange={(e) => changeHandler(e)}></input>)}
                        <input className="new-input" type="text" defaultValue="" placeholder="Add new"></input>
                        <button type="button" id="add-nickname" onClick={(e) => addNickname(e)}>+</button>
                    </div>
                    <button type="submit" id="submit-changes" onClick={(e) => submitChanges(e)}>Submit Changes</button>
                    <p className="edit-complete hidden">Changes saved!</p>
                </div>
            :
            ''
            }
        </>
    );
}

export default EditView;