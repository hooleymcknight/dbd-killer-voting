# to change anything about how the bots run, you can just change it here. no need to track down the startup folder again.

# change drive here if files not on the C drive
H:

# put the path to the target folder here. everything after the drive letter
cd \Documents\Coding\Bots\other-bots\chris-killers-bot\

# this line ensures nothing is already running
pm2 delete all

# start the twitch bot
pm2 start src/bot/bot.js

#start up the React display
npm run start