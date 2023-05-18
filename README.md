# Vote for Next Killer Bot

## Installation
1. Download files.
     - In the top right-hand corner of this page, click the green "Code" button. From that dropdown, click "Download zip."
     - Pick a good place for your files where you are less likely to move them. You can move them later, but you'll have to update paths every time you move this folder (mentioned below).
     - Unzip your files in the location that you selected.
2. [Install node](https://nodejs.org/en).
     - Pick a place on the C: drive.
     - Do not automatically install the "necessary tools." They aren't necessary.
     - All other settings can remain the same.
3. Install pm2.
     - Right-click your "install-pm2.ps1" file and "run with powershell."
4. Edit path file for startup.cmd. ![path to edit in startup.cmd](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/startup_edit.png)
5. Edit drive letter and path file for start-bot.ps1. ![path to edit in start-bot.ps1](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/edit_ps1.png)
6. Create and place shortcuts for startup.cmd and stop.cmd, if desired. Right-click and click "Create shortcut."
7. In OBS, add a new Browser source. Set the URL to: https://localhost:3012, the width to 800, and the height to 744. Clear the custom CSS, and have "Refresh browser when scene becomes active" checked.
     - If you notice a gap in your killers list, you can adjust the height later to fill it. Smaller height = smaller gap. ![setup for browser source in OBS](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/obs_setup.png)
8. Use Alt + click to crop the list to size in your scene.
9. Right-click the list to open Filters, and apply a vertical scroll to the list.

## Run Instructions
These instructions will be your guide for every time you want to start up the bot.
1. Double click your startup shortcut, or `startup.cmd`.
2. Wait for the "completed successfully" display before continuing. Do not close this window. ![process running](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/page_running.png)
3. In OBS, go to the Properties of your list and click "Refresh cache of current page." ![refresh obs source](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/obs_refresh.png)

## Close Instructions
Follow these instructions when you are done using the bot.
1. In the blue Powershell window, type Ctrl + C.
     - You will be prompted to terminate batch job. Type "Y" and hit Enter.
2. Double click your stop shortcut, or stop.cmd.