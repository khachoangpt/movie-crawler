import crawlMovieController from '@/controllers/movie/crawl-movie.controller'
import downloadMovieController from '@/controllers/movie/download-movie.controller'
import downloadMoviesSequentialController from '@/controllers/movie/download-movies-sequential.controller'
import { Router } from 'express'

const router = Router()

export default (app: Router) => {
  app.use('/admin', router)

  app.get('/admin/:id', crawlMovieController)

  app.get('/admin/download/:id', downloadMovieController)

  /** Download lần lượt tất cả phim type=movie theo id, sau đó upload lên S3. Query: onlyNotUploaded=false để xử lý cả phim đã có s3Url */
  app.get('/admin/download-movies', downloadMoviesSequentialController)

  return router
}