import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1753799709687 implements MigrationInterface {
    name = 'UpdateColumn1753799709687'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ADD "tmdbPoster" text`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "tmdbBackdrop" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "tmdbBackdrop"`);
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "tmdbPoster"`);
    }

}
