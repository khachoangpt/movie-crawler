import express, { Express } from 'express'

import adminRoutes from './admin'
import customerRoutes from './customer'

export default (app: Express) => {
  const router = express.Router()
  app.use('/v1/api', router)

  customerRoutes(router)
  adminRoutes(router)

  return router
}