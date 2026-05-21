import "reflect-metadata";
import { DataSource } from "typeorm";

// Import all entities
import { Role } from "../entities/role.entity";
import { Permission } from "../entities/permission.entity";
import { RolePermission } from "../entities/role_permission.entity";
import { User } from "../entities/user.entity";
import { ActivityLog } from "../entities/activity-log.entity";
import { Department } from "../entities/department.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import { Semester } from "../entities/semester.entity";
import { Course } from "../entities/course.entity";
import { Schedule } from "../entities/schedule.entity";
import { Enrollment } from "../entities/enrollment.entity";
import { EnrollmentCourse } from "../entities/enrollment-course.entity";
import { Grade } from "../entities/grade.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [
    Role,
    Permission,
    RolePermission,
    User,
    ActivityLog,
    Department,
    Student,
    Teacher,
    Semester,
    Course,
    Schedule,
    Enrollment,
    EnrollmentCourse,
    Grade,
  ],
  migrations: ["src/database/migrations/*.ts"],
});

console.log("DB CONFIG:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ,
});