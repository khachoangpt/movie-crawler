import crawlMovieController from '@/controllers/movie/crawl-movie.controller'
import downloadMovieController from '@/controllers/movie/download-movie.controller'
import { Router } from 'express'

const router = Router()

export default (app: Router) => {
  app.use('/admin', router)

  app.get('/admin/:id', crawlMovieController)

  app.get('/admin/download/:id', downloadMovieController)

  return router
}