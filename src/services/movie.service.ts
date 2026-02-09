import { dataSource } from "@/data-source"
import { Movie } from "@/entities/movie"
import { MovieType } from "@/entities/movie"
import { appConfig } from "@/configs/app-config"
import { logger } from "@/configs/logger"
import axios from "axios"
import { writeFile, mkdir, readFile, readdir } from 'node:fs/promises'
import { spawn } from 'cross-spawn'
import path from 'node:path'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export class MovieService {
  async crawlMovie(id: number): Promise<Movie> {
    const res = await axios.post('http://phimpal.com/b/g', {
      "operationName": "TitleWatch",
      "variables": {
        "id": `${id}`,
        "server": "1"
      },
      "query": "query TitleWatch($id: String!, $server: String) {\n  title(id: $id, server: $server) {\n    id\n    nameEn\n    nameVi\n    intro\n    publishDate\n    tmdbPoster\n    tmdbBackdrop\n    srcUrl\n    srcServer\n    canUseVpn\n    vpnFee\n    spriteUrl\n    useVipLink\n    reachedWatchLimit\n    needImproveSubtitle\n    needImproveVideo\n    removed\n    type\n    number\n    nextEpisodeId\n    playedAt\n    s3\n    movieInfo {\n      width\n      height\n      __typename\n    }\n    parent {\n      id\n      number\n      intro\n      type\n      publishDate\n      tmdbPoster\n      seasonFull\n      parent {\n        id\n        nameEn\n        nameVi\n    type\n        tmdbBackdrop\n        __typename\n      }\n      __typename\n    }\n    children {\n      id\n      number\n      __typename\n    }\n   postedAt\n       relatedTitles {\n      ...TitleBasics\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment TitleBasics on Title {\n  id\n  nameEn\n  nameVi\n  type\n  postedAt\n  tmdbPoster\n  publishDate\n  intro\n  imdbRating\n  countries\n  genres {\n    nameVi\n    slug\n    __typename\n  }\n  translation\n  __typename\n}\n"
    })
    return res.data?.data?.title
  }

  async insertMovie(id: number) {
    setInterval(async () => {
      const movie = await this.crawlMovie(id)
      if (movie) {
        console.log({
          id: movie.id
        });
        const movieRepository = dataSource.getRepository(Movie)
        const newMovie = new Movie()
        newMovie.id = movie.id
        newMovie.nameEn = movie.nameEn || ''
        newMovie.nameVi = movie.nameVi || ''
        newMovie.parentId = movie.parent?.id
        newMovie.type = movie.type
        newMovie.intro = movie.intro || ''
        newMovie.publishDate = movie.publishDate
        newMovie.number = movie?.number
        newMovie.nextEpisodeId = movie?.nextEpisodeId
        newMovie.tmdbPoster = movie.tmdbPoster
        newMovie.tmdbBackdrop = movie.tmdbBackdrop

        if (newMovie.parentId) {
          const parent = await movieRepository.findOneBy({
            id: newMovie.parentId
          })
          if (!parent) {
            await this.insertMovie(newMovie.parentId)
            return
          }
        }

        await movieRepository.upsert(newMovie, {
          upsertType: 'on-conflict-do-update',
          conflictPaths: ['id']
        })
      }

      id += 1
    }, 1500)
  }

  async spawnAsync(command: string, args: any, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: "inherit",
        ...options,
      });

      child.on("error", (err) => reject(err));
      child.on("exit", (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`${command} exited with code ${code}`));
        }
      });
    });
  }

  downloadSubtitle = async (titleId: number, targetDir: string) => {
    const subtitleInfo = await axios.post("https://phimpal.com/b/g", {
      "variables": { "titleId": `${titleId}` },
      "query":
        "query Subtitles($titleId: String!) {subtitles(titleId: $titleId) {subsceneId language files}}",
    });
    const data = subtitleInfo.data.data.subtitles.filter(
      (sub: any) => sub.language === "vi"
    );
    const subsceneId = data[0].subsceneId;
    const fileName = data[0].files[0];
    const subtitleUrl = `https://phimpal.com/b/subtitle/${subsceneId}/${fileName}/vtt.css`;
    let res: any = "";
    try {
      res = await axios.get(subtitleUrl);
      await writeFile(path.join(targetDir, `${titleId}.srt`), res.data);
    } catch (error) {
      logger.warn(`[downloadSubtitle] titleId=${titleId} – Không tải được subtitle`, {
        subtitleUrl,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /** Download movie to disk, returns absolute path of the .ts file */
  async downloadMovie(id: number): Promise<string | null> {
    let movie: { id: number; nameEn?: string; srcUrl?: string } | undefined;
    try {
      const res = await axios.post("https://phimpal.com/b/g", {
        "variables": { "id": `${id}` },
        "query":
          "query TitleWatch($id: String) {title(id: $id) {id nameEn srcUrl}}",
      });
      movie = res.data?.data
    } catch (err) {
      logger.error(`[downloadMovie] id=${id} – Gọi API phimpal thất bại`, {
        message: err instanceof Error ? err.message : String(err),
        response: axios.isAxiosError(err) ? { status: err.response?.status, data: err.response?.data } : undefined,
      });
      return null;
    }

    if (!movie) {
      logger.warn(`[downloadMovie] id=${id} – API không trả về title (data.title null/undefined)`);
      return null;
    }
    if (!movie.srcUrl) {
      logger.warn(`[downloadMovie] id=${id} – Title không có srcUrl (nameEn: ${movie.nameEn ?? 'N/A'})`);
      return null;
    }

    const { srcUrl, nameEn, id: movieId } = movie;
    const folderName = nameEn ? `${movieId} - ${nameEn}` : String(movieId);
    const baseDir = path.resolve(process.cwd(), 'downloaded', folderName);

    try {
      await mkdir(baseDir, { recursive: true });
    } catch (err) {
      logger.error(`[downloadMovie] id=${id} – Tạo thư mục thất bại: ${baseDir}`, {
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }

    try {
      await this.downloadSubtitle(id, baseDir);
    } catch (err) {
      logger.warn(`[downloadMovie] id=${id} – Tải subtitle thất bại (bỏ qua, tiếp tục tải video)`, {
        message: err instanceof Error ? err.message : String(err),
      });
    }

    const outputFileName = nameEn ? `${movieId} - ${nameEn}.ts` : `${movieId}.ts`;
    const hlsdlPath = 'hlsdl';

    try {
      await this.spawnAsync(
        hlsdlPath,
        ["-b", "-f", "-o", outputFileName, srcUrl],
        { stdio: "inherit", cwd: baseDir }
      );
    } catch (err) {
      logger.error(`[downloadMovie] id=${id} – hlsdl chạy thất bại (file: ${outputFileName}, cwd: ${baseDir})`, {
        message: err instanceof Error ? err.message : String(err),
      });
      return null;
    }

    return path.join(baseDir, outputFileName);
  }

  /** Get movies with type=movie from DB, order by id (optional: only not yet uploaded) */
  async getMoviesToProcess(onlyNotUploaded = true): Promise<Movie[]> {
    const repo = dataSource.getRepository(Movie);
    const qb = repo
      .createQueryBuilder('m')
      .where('m.type = :type', { type: MovieType.MOVIE })
      .orderBy('m.id', 'ASC');
    if (onlyNotUploaded) {
      qb.andWhere('(m.s3Url IS NULL OR m.s3Url = :empty)', { empty: '' });
    }
    return qb.getMany();
  }

  private buildS3Url(s3Key: string): string {
    const { region, bucket, endpoint } = appConfig.s3;
    const useCustomEndpoint = endpoint && !endpoint.includes('amazonaws.com');
    if (useCustomEndpoint) {
      return `${endpoint!.replace(/\/$/, '')}/${bucket}/${s3Key}`;
    }
    return `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
  }

  /** Upload một file lên S3 */
  async uploadFileToS3(localFilePath: string, s3Key: string, contentType?: string): Promise<void> {
    const { region, bucket, endpoint, accessKeyId, secretAccessKey } = appConfig.s3;
    if (!bucket) {
      throw new Error('S3 config missing: AWS_S3_BUCKET');
    }
    const useCustomEndpoint = endpoint && !endpoint.includes('amazonaws.com');
    const client = new S3Client({
      region: region || 'ap-southeast-1',
      ...(useCustomEndpoint && { endpoint }),
      ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } }),
    });
    const body = await readFile(localFilePath);
    const ext = path.extname(localFilePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.ts': 'video/mp2t',
      '.srt': 'application/x-subrip',
      '.vtt': 'text/vtt',
    };
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: body,
        ContentType: contentType ?? contentTypes[ext] ?? 'application/octet-stream',
      })
    );
  }

  /** Upload toàn bộ thư mục lên S3 (prefix dạng movies/123/). Trả về URL file .ts chính (dùng cho s3Url). */
  async uploadFolderToS3(localFolderPath: string, s3Prefix: string): Promise<string> {
    const entries = await readdir(localFolderPath, { withFileTypes: true });
    let mainTsUrl = '';
    const prefix = s3Prefix.endsWith('/') ? s3Prefix : s3Prefix + '/';

    for (const entry of entries) {
      const fullPath = path.join(localFolderPath, entry.name);
      const relativePath = path.relative(localFolderPath, fullPath).split(path.sep).join('/');
      const s3Key = prefix + relativePath;

      if (entry.isFile()) {
        await this.uploadFileToS3(fullPath, s3Key);
        if (entry.name.endsWith('.ts')) mainTsUrl = this.buildS3Url(s3Key);
      } else if (entry.isDirectory()) {
        const subUrl = await this.uploadFolderToS3(fullPath, prefix + relativePath + '/');
        if (subUrl) mainTsUrl = mainTsUrl || subUrl;
      }
    }
    return mainTsUrl;
  }

  /** Download one movie then upload cả folder lên S3 và update DB */
  async downloadAndUploadMovie(id: number): Promise<{ id: number; s3Url?: string; error?: string }> {
    const repo = dataSource.getRepository(Movie);
    const movie = await repo.findOneBy({ id });
    if (!movie) return { id, error: 'Movie not found' };

    const localFilePath = await this.downloadMovie(id);
    if (!localFilePath) return { id, error: 'Download failed or no srcUrl' };

    const folderPath = path.dirname(localFilePath);
    const s3Prefix = `movies/${id}`;
    const s3Url = await this.uploadFolderToS3(folderPath, s3Prefix);

    await repo.update(
      { id },
      { s3Url: s3Url || undefined, downloadedAt: new Date() }
    );
    return { id, s3Url: s3Url || undefined };
  }

  /** Download and upload all type=movie films in order by id */
  async downloadAndUploadMoviesSequentially(onlyNotUploaded = true): Promise<{ processed: number; results: { id: number; s3Url?: string; error?: string }[] }> {
    const movies = await this.getMoviesToProcess(onlyNotUploaded);
    const results: { id: number; s3Url?: string; error?: string }[] = [];
    for (const movie of movies) {
      try {
        const result = await this.downloadAndUploadMovie(movie.id);
        results.push(result);
      } catch (err) {
        results.push({ id: movie.id, error: err instanceof Error ? err.message : String(err) });
      }
    }
    return { processed: movies.length, results };
  }
}