import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1753796564939 implements MigrationInterface {
    name = 'UpdateColumn1753796564939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" RENAME COLUMN "numberOfEpisode" TO "number"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" RENAME COLUMN "number" TO "numberOfEpisode"`);
    }

}
