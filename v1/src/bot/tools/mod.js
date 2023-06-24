const modIds = [
  '72383101', // chris
  '50819918', // holly
  '146866331', //katie
]

const isMod = (user) => {
  if (modIds.includes(user['user-id'])) return true
  return false
}

module.exports = { isMod }