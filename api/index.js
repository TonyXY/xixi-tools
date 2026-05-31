const express = require('express')
const path = require('path')
const movieRouter = require(path.resolve(__dirname, '../server/movie-api'))

const app = express()

// CORS — allow frontend origin (same-origin on Vercel, plus dev origins)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// Mount the movie API router at /api/movie
app.use('/api/movie', movieRouter)

module.exports = app
