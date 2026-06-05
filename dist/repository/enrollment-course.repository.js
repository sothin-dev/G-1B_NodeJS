"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const enrollment_course_entity_1 = require("../entities/enrollment-course.entity");
class EnrollmentCourseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(enrollment_course_entity_1.EnrollmentCourse));
    }
    async listCourseStudents(courseId) {
        const records = await this.repo.find({
            where: {
                course: {
                    id: courseId,
                },
            },
            relations: [
                "enrollment",
                "enrollment.student",
                "enrollment.student.user",
            ],
        });
        return records.map((record) => record.enrollment.student);
    }
    async courseEnrollmentCount(courseId) {
        return this.repo.count({
            where: {
                course: {
                    id: courseId,
                },
            },
        });
    }
}
exports.default = new EnrollmentCourseRepository();
