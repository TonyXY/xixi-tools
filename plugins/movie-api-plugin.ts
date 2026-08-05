import { Plugin } from 'vite'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import type movieRouterType from '../server/movie-api.js'

export function movieApiPlugin(): Plugin {
  return {
    name: 'movie-api',
    configureServer(server) {
      // express/sharp/cors live in server/node_modules, so anchor the require
      // base at server/index.js to make both `express` and `./movie-api.js` resolve.
      const require = createRequire(join(process.cwd(), 'server/index.js'))
      const express = require('express')
      const movieRouter = require('./movie-api.js') as typeof movieRouterType

      // Vite's connect middleware never runs expressInit, so res lacks
      // status/json. app.handle() adds them via setPrototypeOf(res, app.response),
      // just like http.createServer(app) does in production.
      const app = express()
      app.use('/api/movie', movieRouter)

      server.middlewares.use('/api/movie', (req, res, next) => {
        app.handle(req, res, next)
      })
    }
  }
}
