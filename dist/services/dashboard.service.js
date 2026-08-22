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
class DashboardService {
    async getAdminOverview() {
        const studentCount = await database_1.AppDataSource.getRepository(student_entity_1.Student).count();
        const teacherCount = await database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).count();
        const courseCount = await database_1.AppDataSource.getRepository(course_entity_1.Course).count();
        const departmentCount = await database_1.AppDataSource.getRepository(department_entity_1.Department).count();
        const enrollmentCount = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).count();
        const pendingEnrollmentsCount = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).count({
            where: { status: "PENDING" },
        });
        const activeSemester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        let topCourses = [];
        try {
            topCourses = await database_1.AppDataSource.getRepository(course_entity_1.Course)
                .createQueryBuilder("course")
                .leftJoin("course.enrollmentCourses", "enrollmentCourse")
                .leftJoin("enrollmentCourse.enrollment", "enrollment")
                .leftJoin("enrollment.semester", "semester")
                .select([
                "course.id AS id",
                "course.name AS name",
                "course.code AS code",
                "course.capacity AS capacity",
                "COUNT(enrollmentCourse.course_id) AS enrollmentCount",
            ])
                .groupBy("course.id")
                .orderBy("enrollmentCount", "DESC")
                .limit(5)
                .getRawMany();
        }
        catch (e) {
            console.error("Top courses query failed:", e);
        }
        return {
            studentCount,
            teacherCount,
            courseCount,
            departmentCount,
            enrollmentCount,
            pendingEnrollmentsCount,
            activeSemester,
            topCourses: (topCourses || []).map((item) => ({
                id: item.id || item.course_id,
                name: item.name || item.course_name,
                code: item.code || item.course_code,
                capacity: Number(item.capacity || 30),
                enrollmentCount: Number(item.enrollmentCount || 0),
            })),
        };
    }
    async getStudentDashboard(userId) {
        const student = await database_1.AppDataSource.getRepository(student_entity_1.Student).findOne({
            where: [
                { user: { id: userId } },
                { userId: userId },
                { id: userId },
            ],
            relations: [
                "user",
                "department",
                "enrollments",
                "enrollments.semester",
                "enrollments.enrollmentCourses",
                "enrollments.enrollmentCourses.course",
                "enrollments.enrollmentCourses.course.teacher",
                "enrollments.enrollmentCourses.course.teacher.user",
                "enrollments.enrollmentCourses.course.schedules",
                "enrollments.enrollmentCourses.course.department",
            ],
        });
        if (!student) {
            throw new app_error_1.AppError("Student profile not found", 404);
        }
        const latestGrades = await database_1.AppDataSource.getRepository(grade_entity_1.Grade).find({
            where: { student: { id: student.id } },
            relations: ["course"],
            order: { created_at: "DESC" },
            take: 10,
        });
        const pendingEnrollments = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).find({
            where: { student: { id: student.id }, status: "PENDING" },
        });
        const approvedEnrollments = (student.enrollments || []).filter(e => e.status === "APPROVED" || e.status === "PENDING");
        const credits = approvedEnrollments.reduce((sum, enrollment) => sum + (enrollment.totalCredits ?? 0), 0);
        const activeSemester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        const coursesMap = new Map();
        for (const enrollment of student.enrollments || []) {
            for (const entry of enrollment.enrollmentCourses || []) {
                if (entry.course && !coursesMap.has(entry.course.id)) {
                    coursesMap.set(entry.course.id, {
                        id: entry.course.id,
                        name: entry.course.name,
                        code: entry.course.code,
                        credits: entry.course.credits,
                        capacity: entry.course.capacity,
                        semesterId: enrollment.semesterId,
                        semesterName: enrollment.semester?.name,
                        enrollmentStatus: enrollment.status,
                        department: entry.course.department?.name,
                        teacher: entry.course.teacher?.user ? `${entry.course.teacher.user.firstName} ${entry.course.teacher.user.lastName}` : null,
                        schedules: entry.course.schedules || [],
                    });
                }
            }
        }
        return {
            student: {
                id: student.id,
                studentNumber: student.studentNumber,
                department: student.department?.name ?? null,
                status: student.status,
                name: student.user ? `${student.user.firstName} ${student.user.lastName}` : student.studentNumber,
                email: student.user?.email,
            },
            credits,
            creditsCount: credits,
            courses: Array.from(coursesMap.values()),
            pendingStatus: pendingEnrollments.length,
            pendingApprovalsCount: pendingEnrollments.length,
            latestGrades,
            activeSemester,
        };
    }
    async getTeacherDashboard(userId) {
        const teacher = await database_1.AppDataSource.getRepository(teacher_entity_1.Teacher).findOne({
            where: [
                { user: { id: userId } },
                { userId: userId },
                { id: userId },
            ],
            relations: ["user", "department", "courses"],
        });
        if (!teacher) {
            throw new app_error_1.AppError("Teacher profile not found", 404);
        }
        const assignedCourses = await database_1.AppDataSource.getRepository(course_entity_1.Course).find({
            where: { teacher: { id: teacher.id } },
            relations: [
                "department",
                "schedules",
                "enrollmentCourses",
                "enrollmentCourses.enrollment",
                "enrollmentCourses.enrollment.student",
                "enrollmentCourses.enrollment.student.user",
                "grades",
            ],
        });
        const activeSemester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        const formattedCourses = assignedCourses.map(course => {
            const enrolledStudents = (course.enrollmentCourses || [])
                .filter(ec => ec.enrollment && ec.enrollment.status === 'APPROVED')
                .map(ec => ec.enrollment?.student)
                .filter(Boolean);
            const gradedCount = (course.grades || []).filter(g => g.isPublished).length;
            return {
                id: course.id,
                name: course.name,
                code: course.code,
                credits: course.credits,
                capacity: course.capacity,
                department: course.department?.name,
                schedules: course.schedules || [],
                enrolledCount: enrolledStudents.length,
                gradedCount,
                pendingGradesCount: Math.max(0, enrolledStudents.length - gradedCount),
            };
        });
        const totalStudentsCount = formattedCourses.reduce((total, c) => total + c.enrolledCount, 0);
        return {
            teacher: {
                id: teacher.id,
                name: teacher.user ? `${teacher.user.firstName} ${teacher.user.lastName}` : 'Faculty',
                email: teacher.user?.email,
                department: teacher.department?.name ?? null,
            },
            assignedCourses: formattedCourses,
            assignedCoursesCount: formattedCourses.length,
            studentCount: totalStudentsCount,
            totalStudentsCount,
            activeSemester,
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
            "COUNT(DISTINCT enrollmentCourse.course_id) AS enrollmentCount",
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
            "COUNT(enrollmentCourse.course_id) AS enrollmentCount",
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
