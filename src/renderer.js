const { ipcRenderer } = require('electron')

document.querySelector('#clear').addEventListener('click', () => {
ipcRenderer.send('click')
})