import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779716033998 implements MigrationInterface {
    name = 'Migration1779716033998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`activity_logs\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NULL, \`action\` varchar(255) NOT NULL, \`metadata\` json NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`semesters\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`year\` int NOT NULL, \`status\` enum ('UPCOMING', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'UPCOMING', \`start_date\` date NOT NULL, \`end_date\` date NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`schedules\` (\`id\` int NOT NULL AUTO_INCREMENT, \`course_id\` int NOT NULL, \`day\` varchar(255) NOT NULL, \`start_time\` time NOT NULL, \`end_time\` time NOT NULL, \`room\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`grades\` (\`id\` int NOT NULL AUTO_INCREMENT, \`student_id\` int NOT NULL, \`course_id\` int NOT NULL, \`assignment_score\` float NULL, \`midterm_score\` float NULL, \`final_score\` float NULL, \`total_score\` float NULL, \`grade\` char(2) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`courses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`credit\` int NOT NULL, \`department_id\` int NULL, \`teacher_id\` int NULL, \`capacity\` int NOT NULL, UNIQUE INDEX \`IDX_86b3589486bac01d2903e22471\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`enrollment_courses\` (\`enrollment_id\` int NOT NULL, \`course_id\` int NOT NULL, PRIMARY KEY (\`enrollment_id\`, \`course_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`enrollments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`student_id\` int NOT NULL, \`semester_id\` int NOT NULL, \`status\` enum ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`total_credits\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`students\` (\`id\` int NOT NULL AUTO_INCREMENT, \`student_number\` varchar(255) NOT NULL, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`department_id\` int NULL, \`status\` enum ('ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED') NOT NULL DEFAULT 'ACTIVE', \`enrollment_year\` int NOT NULL, UNIQUE INDEX \`IDX_a711caeb43450bf6ce3e9086df\` (\`student_number\`), UNIQUE INDEX \`IDX_25985d58c714a4a427ced57507\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`departments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_91fddbe23e927e1e525c152baa\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`teachers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`department_id\` int NULL, UNIQUE INDEX \`IDX_4668d4752e6766682d1be0b346\` (\`user_id\`), UNIQUE INDEX \`REL_4668d4752e6766682d1be0b346\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role_id\` int NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`refresh_token\` varchar(255) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`module\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions\` (\`role_id\` int NOT NULL, \`permission_id\` int NOT NULL, PRIMARY KEY (\`role_id\`, \`permission_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` ADD CONSTRAINT \`FK_d54f841fa5478e4734590d44036\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`schedules\` ADD CONSTRAINT \`FK_b1e10ac4dc72412af1c3f4d736d\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`grades\` ADD CONSTRAINT \`FK_9acca493883cee3b9e8f9e01cd1\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`grades\` ADD CONSTRAINT \`FK_9a927cab52e881e0aa78f8a181b\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_b0a306ca76ad64906bf5082775f\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_fad76a730ee7f68d0a59652fb12\` FOREIGN KEY (\`teacher_id\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollment_courses\` ADD CONSTRAINT \`FK_1b1391af1d3a6491e3d0137830b\` FOREIGN KEY (\`enrollment_id\`) REFERENCES \`enrollments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollment_courses\` ADD CONSTRAINT \`FK_9a80b4eeb3831cfd1dc25ab11c7\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` ADD CONSTRAINT \`FK_307813fe255896d6ebf3e6cd55c\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`enrollments\` ADD CONSTRAINT \`FK_3417af139684bf43c826e6296ef\` FOREIGN KEY (\`semester_id\`) REFERENCES \`semesters\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_c14488f46704b1c5aacfb12d232\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`students\` ADD CONSTRAINT \`FK_7d7f07271ad4ce999880713f05e\` FOREIGN KEY (\`id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD CONSTRAINT \`FK_4668d4752e6766682d1be0b346f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`teachers\` ADD CONSTRAINT \`FK_d95e08718b761696a377d0fcabf\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_d95e08718b761696a377d0fcabf\``);
        await queryRunner.query(`ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_4668d4752e6766682d1be0b346f\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_7d7f07271ad4ce999880713f05e\``);
        await queryRunner.query(`ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_c14488f46704b1c5aacfb12d232\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` DROP FOREIGN KEY \`FK_3417af139684bf43c826e6296ef\``);
        await queryRunner.query(`ALTER TABLE \`enrollments\` DROP FOREIGN KEY \`FK_307813fe255896d6ebf3e6cd55c\``);
        await queryRunner.query(`ALTER TABLE \`enrollment_courses\` DROP FOREIGN KEY \`FK_9a80b4eeb3831cfd1dc25ab11c7\``);
        await queryRunner.query(`ALTER TABLE \`enrollment_courses\` DROP FOREIGN KEY \`FK_1b1391af1d3a6491e3d0137830b\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_fad76a730ee7f68d0a59652fb12\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_b0a306ca76ad64906bf5082775f\``);
        await queryRunner.query(`ALTER TABLE \`grades\` DROP FOREIGN KEY \`FK_9a927cab52e881e0aa78f8a181b\``);
        await queryRunner.query(`ALTER TABLE \`grades\` DROP FOREIGN KEY \`FK_9acca493883cee3b9e8f9e01cd1\``);
        await queryRunner.query(`ALTER TABLE \`schedules\` DROP FOREIGN KEY \`FK_b1e10ac4dc72412af1c3f4d736d\``);
        await queryRunner.query(`ALTER TABLE \`activity_logs\` DROP FOREIGN KEY \`FK_d54f841fa5478e4734590d44036\``);
        await queryRunner.query(`DROP INDEX \`IDX_648e3f5447f725579d7d4ffdfb\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`role_permissions\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`REL_4668d4752e6766682d1be0b346\` ON \`teachers\``);
        await queryRunner.query(`DROP INDEX \`IDX_4668d4752e6766682d1be0b346\` ON \`teachers\``);
        await queryRunner.query(`DROP TABLE \`teachers\``);
        await queryRunner.query(`DROP INDEX \`IDX_91fddbe23e927e1e525c152baa\` ON \`departments\``);
        await queryRunner.query(`DROP TABLE \`departments\``);
        await queryRunner.query(`DROP INDEX \`IDX_25985d58c714a4a427ced57507\` ON \`students\``);
        await queryRunner.query(`DROP INDEX \`IDX_a711caeb43450bf6ce3e9086df\` ON \`students\``);
        await queryRunner.query(`DROP TABLE \`students\``);
        await queryRunner.query(`DROP TABLE \`enrollments\``);
        await queryRunner.query(`DROP TABLE \`enrollment_courses\``);
        await queryRunner.query(`DROP INDEX \`IDX_86b3589486bac01d2903e22471\` ON \`courses\``);
        await queryRunner.query(`DROP TABLE \`courses\``);
        await queryRunner.query(`DROP TABLE \`grades\``);
        await queryRunner.query(`DROP TABLE \`schedules\``);
        await queryRunner.query(`DROP TABLE \`semesters\``);
        await queryRunner.query(`DROP TABLE \`activity_logs\``);
    }

}
