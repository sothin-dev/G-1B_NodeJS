"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
// Import all entities
const role_entity_1 = require("../entities/role.entity");
const permission_entity_1 = require("../entities/permission.entity");
const role_permission_entity_1 = require("../entities/role_permission.entity");
const user_entity_1 = require("../entities/user.entity");
const activity_log_entity_1 = require("../entities/activity-log.entity");
const department_entity_1 = require("../entities/department.entity");
const student_entity_1 = require("../entities/student.entity");
const teacher_entity_1 = require("../entities/teacher.entity");
const semester_entity_1 = require("../entities/semester.entity");
const course_entity_1 = require("../entities/course.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const enrollment_course_entity_1 = require("../entities/enrollment-course.entity");
const grade_entity_1 = require("../entities/grade.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME || process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNCHRONIZE === "true",
    logging: false,
    entities: [
        role_entity_1.Role,
        permission_entity_1.Permission,
        role_permission_entity_1.RolePermission,
        user_entity_1.User,
        activity_log_entity_1.ActivityLog,
        department_entity_1.Department,
        student_entity_1.Student,
        teacher_entity_1.Teacher,
        semester_entity_1.Semester,
        course_entity_1.Course,
        schedule_entity_1.Schedule,
        enrollment_entity_1.Enrollment,
        enrollment_course_entity_1.EnrollmentCourse,
        grade_entity_1.Grade,
    ],
    migrations: ["src/database/migrations/*.ts"],
    connectorPackage: 'mysql2',
    extra: {
        authPlugins: {
            caching_sha2_password: () => () => Buffer.from(`${process.env.DB_PASSWORD ?? ""}\0`),
        },
    },
});
// console.log("DB CONFIG:", {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   username: process.env.DB_USERNAME,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD ,
// });
