"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const student_entity_1 = require("../entities/student.entity");
class StudentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(student_entity_1.Student));
    }
    async findById(id) {
        return this.repo.findOne({
            where: { id },
            relations: ["user", "department"],
        });
    }
    async findByUserId(userId) {
        return this.repo.findOne({
            where: {
                user: {
                    id: userId,
                },
            },
            relations: ["user"],
        });
    }
}
exports.default = new StudentRepository();
