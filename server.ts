import 'reflect-metadata'
import app from '@/app'
import { logger } from '@/configs/logger'
import loaders from '@/loaders'

const bootstrap = async () => {
  await loaders(app)
  
  app.listen(8000, () => {
    logger.info(`Server listening on port ${8000}`)
  })
}

bootstrap()