import { MigrationInterface, QueryRunner } from "typeorm";

export class VerifyUser1724396705839 implements MigrationInterface {
    name = 'VerifyUser1724396705839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "verify" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "verify"
        `);
    }

}
