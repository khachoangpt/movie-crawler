import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1770664109449 implements MigrationInterface {
    name = 'UpdateColumn1770664109449'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ADD "s3Url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "s3Url"`);
    }

}
