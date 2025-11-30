const fs = require('fs').promises;
const { store, killerTextFile } = require('../../helpers/helpers.js');

const killerNicknames = store.get('killerNicknames');
const killerBlank = store.get('killerBlank');
const struckKillers = store.get('struckKillers');

const storeVote = async (message, user) => {
  let vote = message.toLowerCase().split('vote')[1].trim();
  let killersVotes = toJSON(await fs.readFile(killerTextFile, 'utf8'));

  if (Object.values(killersVotes).includes(user.username)) {
    return 'you already voted';
  }
  else {
    // check name
    // then do another check
    const processedVote = checkNames(killersVotes, vote);

    if (!processedVote) {
      return `@${user.username} that's not a killer... can you check the spelling? I can only handle so much`;
    }
    else if (killersVotes[`${processedVote}`].length) {
      return `@${user.username} someone already voted for this killer`;
    }
    else if (struckKillers.includes(processedVote)) {
      return `@${user.username} this killer is currently struck from the game. pick another?`;
    }
    else {
      killersVotes[`${processedVote}`] = user.username;
      await fs.writeFile(killerTextFile, createTxtFile(killersVotes));
      return `@${user.username} I've recorded your vote for ${vote}.`;
    }
  }
}

/**
 * 
 * @param {*} newJSON 
 * @param {*} vote 
 * @returns vote param if not a nickname, false if not a killer at all, fixed name if accepted nickname
 */
const checkNames = (newJSON, vote) => {
  const officialNames = Object.keys(newJSON).map(x => x.toLowerCase());
  if (officialNames.includes(vote)) {
    // the vote matches the listed killer name
    // get the correct case, return it and move on
    return Object.keys(newJSON)[officialNames.indexOf(vote)];
  }
  else {
    // the vote doesn't exactly match. let's see if it matches any of the nicknames
    if (Object.values(killerNicknames).flat(1).includes(vote)) {
      const locArr = Object.values(killerNicknames).find(x => x.includes(vote));
      const locIdx = Object.values(killerNicknames).indexOf(locArr);
      return Object.keys(killerNicknames)[locIdx];
    }
    else {
      // not an accepted nickname
      return false;
    }
  }
}

const pickRandom = (set) => {
  const selectedIndex = Math.floor(Math.random() * (set.length));
  return set[selectedIndex];
}

const clearReplies = [
  "videovSwampert the voting board has been cleared. throw votes in for next round! videovSwampert",
  "videovUgly the voting board has been cleared. throw votes in for next round! videovUgly"
];

const clear = async () => {
  const killersVotes = toJSON(await fs.readFile(killerTextFile, 'utf8'));
  await fs.writeFile(killerTextFile, createTxtFile(killerBlank));
  return [pickRandom(clearReplies), killersVotes];
}

const undoClear = async (previousRound) => {
  await fs.writeFile(killerTextFile, createTxtFile(previousRound));
  return `undo! undo!`;
}

const listVotes = async () => {
  const killersVotes = toJSON(await fs.readFile(killerTextFile, 'utf8'));
  const votes = Object.keys(killersVotes).filter(x => killersVotes[x].length && killersVotes[x] != '\r');
  // excluding \r values ensures that anything recorded as a Return in other file end types won't get the bot confused

  if (!votes.length) {
    return `there are no votes yet`;
  }
  else {
    return votes.map(x => `${x} - ${killersVotes[x]}`).join(', ');
  }
}

const sendVotesObject = async () => {
  const killersVotes = toJSON(await fs.readFile(killerTextFile, 'utf8'));
  return killersVotes;
}

const myVote = async (user) => {
  const killersVotes = toJSON(await fs.readFile(killerTextFile, 'utf8'));
  const vote = Object.keys(killersVotes).filter(x => killersVotes[x] === user.username);

  if (vote.length) {
    return `@${user.username} you voted for ${vote[0]}`;
  }
  else {
    return `@${user.username} you haven't voted yet`;
  }
}

const help = (userIsMod) => {
  let commandsList = 'Commands: !vote (killer) - send in your vote for the next killer. !myvote - see who you voted for.';
  if (userIsMod) commandsList += ' ... Mods only: !clear - clear the votes board. !listvotes - see who all voted for what.';
  return commandsList;
}

const createTxtFile = (json) => {
  let text = '';
  const lastIdx = Object.keys(json).length - 1;
  Object.keys(json).forEach((killer) => {
    text += `${killer} - ${json[killer]}`;
    Object.keys(json).indexOf(killer) === lastIdx ? text += '' : text += '\n';
  });
  return text;
}

const toJSON = (txt) => {
    let keys = txt.split('\n');
    let JSONobject = {};
    keys.forEach((line) => {
        JSONobject[line.split(' - ')[0]] = line.split(' - ')[1];
    })
    return JSONobject;
}

module.exports = { storeVote, clear, undoClear, listVotes, myVote, help, createTxtFile, sendVotesObject };