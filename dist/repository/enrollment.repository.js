"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const enrollment_entity_1 = require("../entities/enrollment.entity");
class EnrollmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment));
    }
    async getEnrollmentHistory(studentId) {
        return this.repo.find({
            where: {
                student: {
                    id: studentId,
                },
            },
            relations: [
                "semester",
                "enrollmentCourses",
                "enrollmentCourses.course",
            ],
            order: {
                created_at: "DESC",
            },
        });
    }
}
exports.default = new EnrollmentRepository();
