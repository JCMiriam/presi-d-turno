import express from 'express'
import cors from 'cors'
import { healthRouter } from './routes/health.js'

export const createApp = () => {
  const app = express()

  app.use(cors())
  app.use(healthRouter)

  return app
}
