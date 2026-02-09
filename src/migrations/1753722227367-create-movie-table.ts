import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMovieTable1753722227367 implements MigrationInterface {
    name = 'CreateMovieTable1753722227367'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "movies" ("id" integer NOT NULL, "nameEn" text NOT NULL, "nameVi" text NOT NULL, "intro" text NOT NULL, "publishDate" date NOT NULL, "type" text NOT NULL, "numberOfEpisode" integer NOT NULL, "nextEpisodeId" integer NOT NULL, "parentId" integer NOT NULL, CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "movies" ADD CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03" FOREIGN KEY ("parentId") REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03"`);
        await queryRunner.query(`DROP TABLE "movies"`);
    }

}
