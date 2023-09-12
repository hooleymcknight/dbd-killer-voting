const Store = require('./store.js');
// const { clientId } = require('../main.js');
const ConfigParser = require('configparser');
const path = require('path');
const conf = new ConfigParser();
conf.read(path.resolve(__dirname, '../../keys/config.ini'));



conf.sections();

const store = new Store({
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 800, height: 600 },
    killerBlank: {"Artist": "", "Blight": "", "Bubba": "", "Clown": "", "DSlinger": "", "Demigrgn": "", "Doctor": "", "Dredge": "", "Freddy": "", "Ghostface": "", "Hag": "", "Hillbilly": "", "Huntress": "", "Knight": "", "Legion": "", "Myers": "", "Nemesis": "", "Nurse": "", "Oni": "", "Pig": "", "Pinhead": "", "Plague": "", "PyrmdHead": "", "Sadako": "", "Singlrty": "", "SkullMrch": "", "Spirit": "", "Trapper": "", "Trickster": "", "Twins": "", "Wesker": "", "Wraith": ""},
    killerNicknames: { "Trapper": ["trap"], "Wraith": ["bingbong", "bing bong"], "Artist": ["art"], "Hillbilly": ["billy"], "Nurse": [], "Myers": ["the shape", "michael", "michael myers", "shape"], "Hag": [], "Doctor": ["doc", "the doctor"], "Huntress": [], "Bubba": ["cannibal"], "Freddy": ["freddie", "nightmare"], "Pig": ["piggy", "miss piggy"], "Clown": [], "Spirit": [], "Legion": [], "Plague": ["vommy mommy", "vommymommy"], "Ghostface": ["ghosty", "ghostie", "ghost face"], "Demigrgn": ["demo", "demodog", "demo dog", "demigorgon", "demogorgon"], "Oni": [], "DSlinger": ["dslinger", "gunslinger", "death slinger", "deathslinger"], "PyrmdHead": ["executioner", "pyramid head", "pyramid", "pyramidhead"], "Blight": [], "Twins": [], "Trickster": [], "Nemesis": ["nemi"], "Sadako": ["onryo", "ring", "ringu"], "Pinhead": ["cenobite", "pin head"], "Dredge": [], "Wesker": ["mastermind"], "Knight": [], "SkullMrch": ["skull", "skullmerch", "skull merchant", "skullmerchant"], "Singlrty": ["singularity", "the singularity"] }
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
          label: 'Reconnect Twitch',
          type: 'normal',
          click: async (menuItem, browserWindow, event) => {
            browserWindow.webContents.send('reconnectTwitch');
            const { shell } = require('electron');
            await shell.openExternal(`https://id.twitch.tv/oauth2/authorize?client_id=${conf.get('TWITCH', 'client_id')}&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read`);
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
          browserWindow.webContents.send('editModeToggle', [menuItem.checked, store.get('killerNicknames')]);
        }
      }
    ]
  },
  // { role: 'viewMenu' }
  // {
  //     label: 'View',
  //     submenu: [
  //         { role: 'reload' },
  //         { role: 'forceReload' },
  //         { role: 'toggleDevTools' },
  //         { role: 'togglefullscreen' },
  //         { 
  //             label: 'Toggle Dark Mode',
  //             type: 'checkbox',
  //             checked: store.get('darkMode') ? store.get('darkMode') : false,
  //             click: (menuItem, browserWindow, event) => {
  //                 browserWindow.webContents.send('darkModeToggle', menuItem.checked);
  //                 store.set('darkMode', menuItem.checked);
  //             }
  //         }
  //     ]
  // },
  // { role: 'windowMenu' }
  {
      label: 'Window',
      submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      // ...(isMac
      //     ? [
      //         { type: 'separator' },
      //         { role: 'front' },
      //         { type: 'separator' },
      //         { role: 'window' }
      //     ]
      //     : [
      //         { role: 'close' }
      //     ])
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
          }
      ]
  }
]

module.exports = { store, template }