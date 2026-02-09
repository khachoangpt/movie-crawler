import { dataSource } from "@/data-source"
import { Movie } from "@/entities/movie"
import axios from "axios"
import { writeFile, mkdir } from 'node:fs/promises'
import { spawn, } from 'cross-spawn'

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

  downloadSubtitle = async (titleId: number) => {
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
      writeFile(`${titleId}.srt`, res.data);
    } catch (error) {
      console.log("Cant get subtitle", subtitleUrl);
    }
  };

  async downloadMovie(id: number) {
    const movie = await axios
      .post("https://phimpal.com/b/g", {
        "variables": {
          "id": `${id}`,
        },
        "query":
          "query TitleWatch($id: String) {title(id: $id) {id nameEn srcUrl}}",
      })
      .then((res) => res.data.data.title);
    const { srcUrl, nameEn, id: movieId } = movie;

    const folderName = `downloaded/${nameEn ? `${movieId} - ${nameEn}` : movieId}`;
    await mkdir(folderName, { recursive: true });
    process.chdir(folderName);
    await this.downloadSubtitle(id);

    await this.spawnAsync(
      "../hlsdl",
      [
        "-b",
        "-f",
        "-o",
        `${nameEn ? `${movieId} - ${nameEn}` : movieId}.ts`,
        `${srcUrl}`,
      ],
      {
        stdio: "inherit",
      }
    );
  }
}