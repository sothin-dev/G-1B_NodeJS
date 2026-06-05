"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const semester_entity_1 = require("../entities/semester.entity");
class SemesterRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(semester_entity_1.Semester));
    }
    async findByNameAndYear(name, year) {
        return this.findOne({ name, year });
    }
    async findByStatus(status) {
        return this.findMany({ status });
    }
    async findByIdWithEnrollments(id) {
        return this.repo.findOne({
            where: { id },
            relations: ["enrollments"],
        });
    }
}
exports.default = new SemesterRepository();
