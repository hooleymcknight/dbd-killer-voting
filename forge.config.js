const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    // icon: './src/assets/dbd-perk_56.ico',
    executableName: 'DBD Killer Voting',
    iconUrl: 'https://raw.githubusercontent.com/hooleymcknight/dbd-killer-voting/main/src/assets/favicon.ico',
    // iconUrl: 'C:/Users/Hooley/Downloads/dbd-perk_56.ico',
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        // iconUrl: 'C:/Users/Hooley/Downloads/dbd-perk_56.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        // iconUrl: 'C:/Users/Hooley/Downloads/dbd-perk_56.ico',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        // iconUrl: 'C:/Users/Hooley/Downloads/dbd-perk_56.ico',
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              // rhmr: 'react-hot-loader/patch',
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              // preload: {
              //   js: './src/preload.js',
              // },
            },
          ],
        },
      },
    },
  ],
};
