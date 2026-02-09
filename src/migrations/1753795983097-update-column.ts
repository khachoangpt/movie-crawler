import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateColumn1753795983097 implements MigrationInterface {
    name = 'UpdateColumn1753795983097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."movies_type_enum" AS ENUM('movie', 'episode', 'show', 'season')`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "type" "public"."movies_type_enum" NOT NULL DEFAULT 'movie'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movies" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."movies_type_enum"`);
        await queryRunner.query(`ALTER TABLE "movies" ADD "type" text NOT NULL`);
    }

}
