import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779443317407 implements MigrationInterface {
    name = 'Migration1779443317407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_25985d58c714a4a427ced57507\` ON \`students\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`first_name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`last_name\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`last_name\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`first_name\``);
        await queryRunner.query(`ALTER TABLE \`students\` ADD \`email\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_25985d58c714a4a427ced57507\` ON \`students\` (\`email\`)`);
    }

}
