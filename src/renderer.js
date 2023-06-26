const { ipcRenderer } = require('electron')

document.querySelector('#clear').addEventListener('click', () => {
    ipcRenderer.send('clear')
})

document.querySelector('#closeVoting').addEventListener('click', () => {
    const closeVotingBtn = document.querySelector('#closeVoting span')
    const state = closeVotingBtn.textContent
    if (state == 'Close') {
        closeVotingBtn.innerText = 'Open'
    }
    else {
        closeVotingBtn.innerText = 'Close'
    }
    ipcRenderer.send('toggleVoting')
})