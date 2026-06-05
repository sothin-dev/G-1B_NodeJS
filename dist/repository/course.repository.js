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
            .leftJoinAndSelect("course.schedules", "schedules")
            .leftJoinAndSelect("course.enrollmentCourses", "enrollmentCourses")
            .leftJoinAndSelect("enrollmentCourses.enrollment", "enrollment")
            .leftJoinAndSelect("enrollment.semester", "semester");
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
        return qb.getMany();
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
                "schedules",
            ],
        });
    }
    async saveCourse(course) {
        return this.repo.save(course);
    }
}
exports.default = new CourseRepository();
