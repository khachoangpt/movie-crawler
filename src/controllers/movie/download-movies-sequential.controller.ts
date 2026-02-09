import { MovieService } from "@/services/movie.service"
import { Request, Response } from "express"

export default async (req: Request, res: Response) => {
  const movieService = new MovieService()
  const onlyNotUploaded = req.query.onlyNotUploaded !== 'false'
  try {
    const { processed, results } = await movieService.downloadAndUploadMoviesSequentially(onlyNotUploaded)
    res.status(200).json({ processed, results })
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err),
    })
  }
}
