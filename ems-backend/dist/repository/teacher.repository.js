"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const teacher_entity_1 = require("../entities/teacher.entity");
class TeacherRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(teacher_entity_1.Teacher));
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
exports.default = new TeacherRepository();
