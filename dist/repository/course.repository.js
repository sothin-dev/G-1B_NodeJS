"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const course_entity_1 = require("../entities/course.entity");
class CourseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(course_entity_1.Course));
    }
    async listCourses(filters) {
        const qb = this.repo
            .createQueryBuilder("course")
            .leftJoinAndSelect("course.department", "department")
            .leftJoinAndSelect("course.teacher", "teacher")
            .leftJoinAndSelect("teacher.user", "teacherUser")
            .leftJoinAndSelect("course.schedules", "schedules")
            .leftJoinAndSelect("course.enrollmentCourses", "enrollmentCourses")
            .leftJoinAndSelect("enrollmentCourses.enrollment", "enrollment")
            .leftJoinAndSelect("enrollment.semester", "semester");
        if (filters.search) {
            qb.andWhere("(course.code LIKE :search OR course.name LIKE :search)", { search: `%${filters.search}%` });
        }
        if (filters.departmentId) {
            qb.andWhere("course.departmentId = :departmentId", {
                departmentId: filters.departmentId,
            });
        }
        if (filters.teacherId) {
            qb.andWhere("course.teacherId = :teacherId", {
                teacherId: filters.teacherId,
            });
        }
        if (filters.semesterId) {
            qb.andWhere("semester.id = :semesterId", {
                semesterId: filters.semesterId,
            });
        }
        qb.orderBy("course.created_at", "DESC");
        qb.distinct(true);
        const courses = await qb.getMany();
        return courses.map(c => ({
            ...c,
            enrolledCount: c.enrollmentCourses ? c.enrollmentCourses.length : 0,
        }));
    }
    async findByCode(code) {
        return this.findOne({
            code,
        });
    }
    async findWithRelations(id) {
        return this.repo.findOne({
            where: {
                id,
            },
            relations: [
                "department",
                "teacher",
                "teacher.user",
                "schedules",
            ],
        });
    }
    async saveCourse(course) {
        return this.repo.save(course);
    }
}
exports.default = new CourseRepository();
