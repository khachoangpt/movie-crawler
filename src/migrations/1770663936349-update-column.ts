import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1770663936349 implements MigrationInterface {
    name = 'UpdateColumn1770663936349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ADD "downloadedAt" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "downloadedAt"`);
    }

}
