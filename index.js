const express = require('express')
const app = express()
app.use(express.static('public'))
app.use(express.json())

const { Deepgram } = require('@deepgram/sdk')
const deepgram = new Deepgram(process.env.DG_KEY)

const axios = require('axios')

app.get('/deepgram-token', async (req, res) => {
  const { key } = await deepgram.keys.create(process.env.DG_PROJECT_ID, 'temp badge key', ['usage:write'], { timeToLive: 10 })
  res.json({ key })
})

app.post('/translate', async (req, res) => {
  const url = 'https://dev-api.itranslate.com/translation/v2/'
  const headers = { 'Authorization': `Bearer ${process.env.ITRANSLATE_KEY}`}
  const payload = {
      source: { dialect: 'en', text: req.body.text },
      target: { dialect: req.body.lang }
  }
  
  const { data } = await axios.post(url, payload, { headers })
  res.json({ lang: req.body.lang, text: data.target.text })
})

const port = process.env.PORT || 3000
app.listen(port, console.log(`Listening at ${port} on ${new Date().toISOString()}`))