const fs = require('fs').promises;
const Store = require('./store.js');
const killers = require('../tools/voting/killers.json');

// const killerTextFile = 'H:/Documents/Coding/Apps/dbd-killer-voting/dbd-killer-voting/src/tools/voting/killer_list.txt';
const killerTextFile = 'D:/Videos/videovomit/bots/killerbot/killerlist.txt';

const killerBlank = [...Object.keys(killers)];

const store = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds: { width: 800, height: 600 },
        killerBlank: killerBlank,
        killerNicknames: killers,
        previousRound: killerBlank,
        struckKillers: [],
        oauth: '',
        // modType: 'local', // other option is 'local' // oh, is it now?
        // localMods: [
        //   {"username": "videovomit", "id": "72383101"},
        // ],
    }
});

const template = [
    // { role: 'appMenu' }
    // ...(isMac
    //     ? [{
    //         label: app.name,
    //         submenu: [
    //         { role: 'about' },
    //         { type: 'separator' },
    //         { role: 'services' },
    //         { type: 'separator' },
    //         { role: 'hide' },
    //         { role: 'hideOthers' },
    //         { role: 'unhide' },
    //         { type: 'separator' },
    //         { role: 'quit' }
    //         ]
    //     }]
    //     : []),
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
        // isMac ? { role: 'close' } : { role: 'quit' }
        {
            label: 'Undo Clear',
            type: 'normal',
            click: async (menuItem, browserWindow, event) => {
            browserWindow.webContents.send('undoClear');
            }
        },
        ]
    },
    {
        label: 'Settings',
        submenu: [
        {
            label: 'Edit Killers',
            type: 'checkbox',
            checked: false,
            click: (menuItem, browserWindow, event) => {
            browserWindow.webContents.send('editModeToggle', [menuItem.checked, { nicknames: store.get('killerNicknames'), struck: store.get('struckKillers') }]);
            }
        },
        //   {
        //     label: 'Mods',
        //     submenu: [
        //       {
        //         label: 'Edit Bot Mods',
        //         type: 'normal',
        //         click: (menuItem, browserWindow, event) => {
        //           browserWindow.webContents.send('changeState', ['editMods', store.get('localMods')]);
        //         }
        //       }
        //     ]
        //   }
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            // { role: 'reload' },
            // { role: 'forceReload' },
            // { role: 'toggleDevTools' },
            // { role: 'togglefullscreen' },
            { 
                label: 'Aggro Mode',
                type: 'checkbox',
                checked: store.get('aggroMode') ? store.get('aggroMode') : false,
                click: (menuItem, browserWindow, event) => {
                    browserWindow.webContents.send('aggroModeToggle', menuItem.checked);
                    store.set('aggroMode', menuItem.checked);
                }
            }
        ]
    },
    // { role: 'windowMenu' }
    // {
    //     label: 'Window',
    //     submenu: [
    //     { role: 'minimize' },
    //     { role: 'zoom' },
    //     // ...(isMac
    //     //     ? [
    //     //         { type: 'separator' },
    //     //         { role: 'front' },
    //     //         { type: 'separator' },
    //     //         { role: 'window' }
    //     //     ]
    //     //     : [
    //     //         { role: 'close' }
    //     //     ])
    //     ]
    // },
    {
        label: 'Setup',
        submenu: [
        // isMac ? { role: 'close' } : { role: 'quit' }
        {
            label: 'Connect Bot Account',
            type: 'normal',
            click: async (menuItem, browserWindow, event) => {
            browserWindow.webContents.send('changeState', ['startSetup']);
            }
        },
        {
            label: 'Reconnect Twitch',
            type: 'normal',
            click: async (menuItem, browserWindow, event) => {
                const clientId = store.get('clientId');
                if (clientId) {
                    browserWindow.webContents.send('changeState', ['reconnectTwitch']);
                    const { shell } = require('electron');
                    await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
                }
                else {
                    browserWindow.webContents.send('changeState', ['startSetup']);
                }
            }
        }
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'See My Portfolio',
                click: async () => {
                    const { shell } = require('electron');
                    await shell.openExternal('https://hooleymcknight.com/');
                }
            },
            {
                label: 'v3.1.1',
            }
        ]
    }
]

const toJSON = (txt) => {
    let keys = txt.split('\n');
    let JSONobject = {};
    keys.forEach((line) => {
        JSONobject[line.split(' - ')[0]] = line.split(' - ')[1];
    })
    return JSONobject;
}

module.exports = { store, template, killerTextFile }