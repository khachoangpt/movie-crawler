import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

export enum MovieType {
      MOVIE = 'movie',
      EPISODE = 'episode',
      SHOW = 'show',
      SEASON = 'season'
    }

@Entity({name: 'movies'})
export class Movie {
  @PrimaryColumn({type: 'int'})
  id: number

  @Column({type: 'text'})
  nameEn: string

  @Column({type: 'text'})
  nameVi: string

  @Column({type: 'text'})
  intro: string

  @Column({type: 'date', nullable: true})
  publishDate: Date

  @Column({type: 'enum', enum: MovieType, default: MovieType.MOVIE })
  type: MovieType

  @Column({type: 'int', nullable: true})
  number: number

  @Column({type: 'int', nullable: true})
  nextEpisodeId: number

  @Column({type: 'int', nullable: true})
  parentId: number

  @Column({type: 'text', nullable: true})
  tmdbPoster: string

  @Column({type: 'text', nullable: true})
  tmdbBackdrop: string

  @Column({type: 'date', nullable: true})
  downloadedAt: Date

  @Column({type: 'text', nullable: true})
  s3Url: string

  @ManyToOne(() => Movie, movie => movie.children)
  parent: Movie;

  @OneToMany(() => Movie, movie => movie.parent)
  children: Movie[];
}

