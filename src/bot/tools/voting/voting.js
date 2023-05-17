const fs = require('fs')
const path = require('path')
const killerNicknames = require('./killer_names.json')
const killerBlank = require('./killers_blank.json')

const store = (message, user) => {
  let newJSON = require('./killers.json')
  console.log(newJSON)
  let vote = message.toLowerCase().split('vote')[1].trim()

  if (Object.values(newJSON).includes(user.username)) {
    console.log('you already voted')
    return 'you already voted'
  }
  else {
    // check name
    // then do another check
    const processedVote = checkNames(newJSON, vote)

    if (!processedVote) {
      console.log('not a killer')
      return `@${user.username} that's not a killer... can you check the spelling? I can only handle so much`
    }
    else if (newJSON[`${processedVote}`].length) {
      console.log('someone took it')
      return `@${user.username} someone already voted for this killer`
    }
    else {
      newJSON[`${processedVote}`] = user.username

      console.log('before write file')
      fs.writeFile(path.join(__dirname, '/killers.json'), JSON.stringify(newJSON), err => {
        if (err) {
          throw err
        }
        console.log('updated file')
      })
      console.log('recorded')
      return `@${user.username} I've recorded your vote for ${vote}.`
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
  const officialNames = Object.keys(newJSON)
  if (officialNames.includes(vote)) {
    // the vote matches the listed killer name
    // return it and move on
    return vote
  }
  else {
    // the vote doesn't exactly match. let's see if it matches any of the nicknames
    if (Object.values(killerNicknames).flat(1).includes(vote)) {
      const locArr = Object.values(killerNicknames).find(x => x.includes(vote))
      const locIdx = Object.values(killerNicknames).indexOf(locArr)
      return Object.keys(killerNicknames)[locIdx]
    }
    else {
      // not an accepted nickname
      return false
    }
  }
}

const pickRandom = (set) => {
  const selectedIndex = Math.floor(Math.random() * (set.length))
  return set[selectedIndex]
}

const clearReplies = [
  "videovSwampert the voting board has been cleared. throw votes in for next round! videovSwampert",
  "videovUgly the voting board has been cleared. throw votes in for next round! videovUgly"
]

const clear = () => {
  fs.writeFile(path.join(__dirname, '/killers.json'), JSON.stringify(killerBlank), err => {
    if (err) {
      throw err
    }
    console.log('cleared file')
  })
  return pickRandom(clearReplies)
}

const listVotes = () => {
  let voteList = require('./killers.json')
  const votes = Object.keys(voteList).filter(x => voteList[x].length)

  if (!votes.length) {
    return `there are no votes yet`
  }
  else {
    return votes.map(x => `${x} - ${voteList[x]}`).join(', ')
  }
}

const myVote = (user) => {
  let voteList = require('./killers.json')
  const vote = Object.keys(voteList).filter(x => voteList[x] === user.username)

  if (vote.length) {
    return `@${user.username} you voted for ${vote[0]}`
  }
  else {
    return `@${user.username} you haven't voted yet`
  }
}

module.exports = { store, clear, listVotes, myVote }