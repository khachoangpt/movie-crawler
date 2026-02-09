import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1753795103353 implements MigrationInterface {
    name = 'UpdateColumn1753795103353'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03"`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "numberOfEpisode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "nextEpisodeId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "parentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ADD CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03" FOREIGN KEY ("parentId") REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03"`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "parentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "nextEpisodeId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "numberOfEpisode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "movies" ADD CONSTRAINT "FK_6ca4dbc7d326fa56a6f37b17f03" FOREIGN KEY ("parentId") REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
