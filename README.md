# Vote for Next Killer Bot

## Installation

1. Download files.
2. [Install node](https://nodejs.org/en).
     - Pick a place on the C: drive.
     - Do not automatically install the "necessary tools." They aren't necessary.
     - All other settings can remain the same.
3. Install pm2.
     - Right-click your "install-pm2.ps1" file and "run with powershell."
4. Edit path file for startup.cmd ![path to edit in startup.cmd](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/startup_edit.png)
5. Place your shortcut.
6. In OBS, add a new Browser source. Set the URL to: https://localhost:3012, the width to 800, and the height to 744. Clear the custom CSS, and have "Refresh browser when scene becomes active" checked.
     - If you notice a gap in your killers list, you can adjust the height later to fill it. Smaller height = smaller gap. ![setup for browser source in OBS](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/obs_setup.png)
7. Use Alt + click to crop the list to size in your scene.
8. Right-click the list to open Filters, and apply a vertical scroll to the list.

## Run Instructions
1. Double click your startup shortcut.
2. Wait for the "completed successfully" display before continuing. Do not close this window. ![process running](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/page_running.png)
3. In OBS, go to the Properties of your list and click "Refresh cache of current page." ![refresh obs source](https://github.com/hooleymcknight/chris-killers-bot/blob/main/instructions-images/obs_refresh.png)