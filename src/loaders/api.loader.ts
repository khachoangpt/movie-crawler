import { Express } from 'express'

import routes from '@/routes'

type ApiLoaderParams = {
  app: Express
}

export default async ({ app }: ApiLoaderParams) => {
  app.use(routes(app))
}