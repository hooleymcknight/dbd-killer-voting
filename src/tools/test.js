const fetch = require('node-fetch')

fetch('https://id.twitch.tv/oauth2/authorize?client_id=ghk8xotyq7tc37kg3m5n8qxnkpgtb0&redirect_uri=http://localhost:3000&response_type=token&scope=channel:moderate+chat:edit+chat:read')
.then((res) => console.log(res))