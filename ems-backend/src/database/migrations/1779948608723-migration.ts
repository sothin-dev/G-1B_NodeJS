import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779948608723 implements MigrationInterface {
    name = 'Migration1779948608723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`activity_logs\` DROP FOREIGN KEY \`FK_d54f841fa5478e4734590d44036\``);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` CHANGE \`user_id\` \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` ADD \`metadata\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`assignment_score\` \`assignment_score\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`midterm_score\` \`midterm_score\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`final_score\` \`final_score\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`total_score\` \`total_score\` float NULL`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`grade\` \`grade\` char(2) NULL`);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_b0a306ca76ad64906bf5082775f\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_fad76a730ee7f68d0a59652fb12\``);
        await queryRunner.query(`ALTER TABLE \`courses\` CHANGE \`department_id\` \`department_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`courses\` CHANGE \`teacher_id\` \`teacher_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_c14488f46704b1c5aacfb12d232\``);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`department_id\` \`department_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_d95e08718b761696a377d0fcabf\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` CHANGE \`department_id\` \`department_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`refresh_token\` \`refresh_token\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` ADD CONSTRAINT \`FK_d54f841fa5478e4734590d44036\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_b0a306ca76ad64906bf5082775f\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_fad76a730ee7f68d0a59652fb12\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_c14488f46704b1c5aacfb12d232\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD CONSTRAINT \`FK_d95e08718b761696a377d0fcabf\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_d95e08718b761696a377d0fcabf\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_c14488f46704b1c5aacfb12d232\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_fad76a730ee7f68d0a59652fb12\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_b0a306ca76ad64906bf5082775f\``);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` DROP FOREIGN KEY \`FK_d54f841fa5478e4734590d44036\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`refresh_token\` \`refresh_token\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`teachers\` CHANGE \`department_id\` \`department_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD CONSTRAINT \`FK_d95e08718b761696a377d0fcabf\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` CHANGE \`department_id\` \`department_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_c14488f46704b1c5aacfb12d232\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` CHANGE \`teacher_id\` \`teacher_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`courses\` CHANGE \`department_id\` \`department_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_fad76a730ee7f68d0a59652fb12\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_b0a306ca76ad64906bf5082775f\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`grade\` \`grade\` char(2) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`total_score\` \`total_score\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`final_score\` \`final_score\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`midterm_score\` \`midterm_score\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`grades\` CHANGE \`assignment_score\` \`assignment_score\` float(12) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` CHANGE \`created_at\` \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` DROP COLUMN \`metadata\``);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` ADD \`metadata\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` CHANGE \`user_id\` \`user_id\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` ADD CONSTRAINT \`FK_d54f841fa5478e4734590d44036\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
