import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1753795595848 implements MigrationInterface {
    name = 'UpdateColumn1753795595848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "publishDate" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" ALTER COLUMN "publishDate" SET NOT NULL`);
    }

}
