# DBD Killer Voting App

This app was built for a friend and fellow Twitch streamer, [@videovomit](https://twitch.tv/videovomit). When streaming Dead by Daylight, VV has giveaways on his stream for people who can correctly guess the killer in their next match. He displays the list of viewers' current votes through a text file asset displayed in his OBS.

Originally, VV had to manually edit the text file every single time someone voted. This averaged 4-7 times per DBD match, which could have resulted in him editing the file around 21 times per hour for as long as he was streaming the game.

I built a Windows app containing a Twitch chat bot that fields viewers' votes on VV's behalf, so that he does not have to type in anyone's votes at all. A viewer can simply type ``!vote KILLER_NAME`` and if they entered a valid option, the bot will accept their vote and update Chris's text file for him. The bot does accept some alternate killer names and a few common misspellings.

The Windows desktop app displays a button labeled "Clear Votes" which will automatically clear all votes and reset the text file when clicked. VV can click this once between rounds to reset the votes, and that's all he has to do. As an additional option, he or an accepted channel moderator may type ``!clear`` into the Twitch chat for the same effect.

![display of the Windows app for DBD Killer Voting](https://hooleymcknight.com/images/projects/dbd-killer-votes-app.png)