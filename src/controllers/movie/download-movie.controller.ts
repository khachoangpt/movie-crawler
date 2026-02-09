import { MovieService } from "@/services/movie.service"
import { Request, Response } from "express"

export default async (req: Request, res: Response) => {
  const movieService: MovieService = new MovieService()
  const { id } = req.params
  await movieService.downloadMovie(Number(id))
  res.status(200).send('OK')
}