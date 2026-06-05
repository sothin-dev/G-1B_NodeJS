"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const app_error_1 = require("../core/errors/app-error");
const course_entity_1 = require("../entities/course.entity");
const department_entity_1 = require("../entities/department.entity");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const grade_entity_1 = require("../entities/grade.entity");
const semester_entity_1 = require("../entities/semester.entity");
const student_entity_1 = require("../entities/student.entity");
const teacher_entity_1 = require("../entities/teacher.entity");
const user_entity_1 = require("../entities/user.entity");
class DashboardService {
    async getAdminOverview() {
        const studentCount = await database_1.AppDataSource.getRepository(student_entity_1.Student).count();
        const enrollmentCount = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).count();
        const activeSemester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        const topCourses = await database_1.AppDataSource.getRepository(course_entity_1.Course)
            .createQueryBuilder("course")
            .leftJoin("course.enrollmentCourses", "enrollmentCourse")
            .leftJoin("enrollmentCourse.enrollment", "enrollment")
            .leftJoin("enrollment.semester", "semester")
            .where("semester.status = :status", { status: semester_entity_1.SemesterStatus.ACTIVE })
            .select(["course.id", "course.name", "course.code", "COUNT(enrollmentCourse.id) AS enrollmentCount"])
            .groupBy("course.id")
            .orderBy("enrollmentCount", "DESC")
            .limit(5)
            .getRawMany();
        return {
            studentCount,
            enrollmentCount,
            activeSemester,
            topCourses: topCourses.map((item) => ({
                id: item.course_id,
                name: item.course_name,
                code: item.course_code,
                enrollmentCount: Number(item.enrollmentCount),
            })),
        };
    }
    async getStudentDashboard(userId) {
        const user = await database_1.AppDataSource.getRepository(user_entity_1.User).findOne({ where: { id: userId } });
        if (!user) {
            throw new app_error_1.AppError("User not found", 404);
        }
        const student = await database_1.AppDataSource.getRepository(student_entity_1.Student).findOne({
            where: { user: { id: userId } },
            relations: ["department", "enrollments", "enrollments.enrollmentCourses", "enrollments.enrollmentCourses.course"],
        });
        if (!student) {
            throw new app_error_1.AppError("Student profile not found", 404);
        }
        const latestGrades = await database_1.AppDataSource.getRepository(grade_entity_1.Grade).find({
            where: { student: { id: student.id } },
            relations: ["course"],
            order: { created_at: "DESC" },
            take: 5,
        });
        const pendingEnrollments = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).find({
            where: { student: { id: student.id } },
        });
        const credits = student.enrollments.reduce((sum, enrollment) => sum + (enrollment.total_credits ?? 0), 0);
        return {
            student: {
                id: student.id,
                studentNumber: student.student_number,
                department: student.department?.name ?? null,
                status: student.status,
            },
            credits,
            courses: student.enrollments.flatMap((enrollment) => enrollment.enrollmentCourses.map((entry) => ({
                id: entry.course?.id,
                name: entry.course?.name,
                code: entry.course?.code,
                credit: entry.course?.credit,
                semesterId: enrollment.semesterId,
            }))),
            pendingStatus: pendingEnrollments.filter((enrollment) => enrollment.status === "PENDING").length,
            latestGrades,
        };
    }
    async getTeacherDashboard(userId) {
        const teacher = await database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).findOne({
            where: { user: { id: userId } },
            relations: ["department", "courses"],
        });
        if (!teacher) {
            throw new app_error_1.AppError("Teacher profile not found", 404);
        }
        const assignedCourses = await database_1.AppDataSource.getRepository(course_entity_1.Course).find({
            where: { teacher: { id: teacher.id } },
            relations: ["enrollmentCourses", "enrollmentCourses.enrollment"],
        });
        const studentCount = assignedCourses.reduce((total, course) => total + (course.enrollmentCourses?.length ?? 0), 0);
        const gradeUploadStatus = assignedCourses.length > 0
            ? { uploaded: true, totalCourses: assignedCourses.length }
            : { uploaded: false, totalCourses: 0 };
        return {
            teacher: {
                id: teacher.id,
                department: teacher.department?.name ?? null,
            },
            assignedCourses,
            studentCount,
            gradeUploadStatus,
        };
    }
    async getEnrollmentTrend() {
        const rows = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment)
            .createQueryBuilder("enrollment")
            .leftJoin("enrollment.semester", "semester")
            .select([
            "semester.name AS semesterName",
            "semester.year AS year",
            "COUNT(enrollment.id) AS totalEnrollments",
        ])
            .groupBy("semester.id")
            .orderBy("semester.year", "ASC")
            .getRawMany();
        return rows.map((row) => ({
            semester: row.semesterName,
            year: Number(row.year),
            totalEnrollments: Number(row.totalEnrollments),
        }));
    }
    async getDepartmentStats() {
        const rows = await database_1.AppDataSource.getRepository(department_entity_1.Department)
            .createQueryBuilder("department")
            .leftJoin("department.students", "student")
            .leftJoin("department.courses", "course")
            .leftJoin("course.enrollmentCourses", "enrollmentCourse")
            .select([
            "department.id AS id",
            "department.name AS name",
            "department.code AS code",
            "COUNT(DISTINCT student.id) AS studentCount",
            "COUNT(DISTINCT enrollmentCourse.id) AS enrollmentCount",
        ])
            .groupBy("department.id")
            .orderBy("studentCount", "DESC")
            .getRawMany();
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            code: row.code,
            studentCount: Number(row.studentCount),
            enrollmentCount: Number(row.enrollmentCount),
        }));
    }
    async getTopCoursesForActiveSemester() {
        const activeSemester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        if (!activeSemester) {
            return [];
        }
        const rows = await database_1.AppDataSource.getRepository(course_entity_1.Course)
            .createQueryBuilder("course")
            .leftJoin("course.enrollmentCourses", "enrollmentCourse")
            .leftJoin("enrollmentCourse.enrollment", "enrollment")
            .leftJoin("enrollment.semester", "semester")
            .where("semester.id = :semesterId", { semesterId: activeSemester.id })
            .select([
            "course.id AS id",
            "course.name AS name",
            "course.code AS code",
            "COUNT(enrollmentCourse.id) AS enrollmentCount",
        ])
            .groupBy("course.id")
            .orderBy("enrollmentCount", "DESC")
            .limit(10)
            .getRawMany();
        return rows.map((row) => ({
            id: row.id,
            name: row.name,
            code: row.code,
            enrollmentCount: Number(row.enrollmentCount),
        }));
    }
}
exports.default = new DashboardService();
