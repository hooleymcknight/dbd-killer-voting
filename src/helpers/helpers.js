const Store = require('./store.js');

// const killerTextFile = 'H:/Documents/Coding/Apps/dbd-killer-voting/src/tools/voting/killer_list.txt';
const killerTextFile = 'D:/Videos/videovomit/bots/killerbot/killerlist.txt';

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 },
    killerBlank: {"Artist": "", "Blight": "", "Bubba": "", "Clown": "", "DSlinger": "", "Demigrgn": "", "Doctor": "", "Dredge": "", "Freddy": "", "Ghostface": "", "Hag": "", "Hillbilly": "", "Huntress": "", "Knight": "", "Legion": "", "Myers": "", "Nemesis": "", "Nurse": "", "Oni": "", "Pig": "", "Pinhead": "", "Plague": "", "PyrmdHead": "", "Sadako": "", "Singlrty": "", "SkullMrch": "", "Spirit": "", "Trapper": "", "Trickster": "", "Twins": "", "Wesker": "", "Wraith": ""},
    killerNicknames: { "Trapper": ["trap"], "Wraith": ["bingbong", "bing bong"], "Artist": ["art"], "Hillbilly": ["billy"], "Nurse": [], "Myers": ["the shape", "michael", "michael myers", "shape"], "Hag": [], "Doctor": ["doc", "the doctor"], "Huntress": [], "Bubba": ["cannibal"], "Freddy": ["freddie", "nightmare"], "Pig": ["piggy", "miss piggy"], "Clown": [], "Spirit": [], "Legion": [], "Plague": ["vommy mommy", "vommymommy"], "Ghostface": ["ghosty", "ghostie", "ghost face"], "Demigrgn": ["demo", "demodog", "demo dog", "demigorgon", "demogorgon"], "Oni": [], "DSlinger": ["dslinger", "gunslinger", "death slinger", "deathslinger"], "PyrmdHead": ["executioner", "pyramid head", "pyramid", "pyramidhead"], "Blight": [], "Twins": [], "Trickster": [], "Nemesis": ["nemi"], "Sadako": ["onryo", "ring", "ringu"], "Pinhead": ["cenobite", "pin head"], "Dredge": [], "Wesker": ["mastermind"], "Knight": [], "SkullMrch": ["skull", "skullmerch", "skull merchant", "skullmerchant"], "Singlrty": ["singularity", "the singularity"] },
    struckKillers: [],
    oauth: '',
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
          label: 'Setup',
          type: 'normal',
          click: async (menuItem, browserWindow, event) => {
            browserWindow.webContents.send('startSetup');
          }
        },
        {
          label: 'Reconnect Twitch',
          type: 'normal',
          click: async (menuItem, browserWindow, event) => {
            const clientId = store.get('clientId');
            if (clientId) {
              browserWindow.webContents.send('reconnectTwitch');
              const { shell } = require('electron');
              await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
            }
            else {
              browserWindow.webContents.send('startSetup');
            }
          }
        }
      ]
  },
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Edit Mode',
        type: 'checkbox',
        checked: false,
        click: (menuItem, browserWindow, event) => {
          browserWindow.webContents.send('editModeToggle', [menuItem.checked, { nicknames: store.get('killerNicknames'), struck: store.get('struckKillers') }]);
        }
      }
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
      role: 'help',
      submenu: [
          {
              label: 'See My Portfolio',
              click: async () => {
                const { shell } = require('electron');
                await shell.openExternal('https://hooleymcknight.com/');
              }
          }
      ]
  }
]

module.exports = { store, template, killerTextFile }