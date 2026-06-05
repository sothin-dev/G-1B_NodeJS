"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const department_entity_1 = require("../entities/department.entity");
class DepartmentRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(department_entity_1.Department));
    }
    async findByCode(code) {
        return this.findOne({ code });
    }
    async findByIdWithRelations(id) {
        return this.repo.findOne({
            where: { id },
            relations: ["courses", "teachers"],
        });
    }
}
exports.default = new DepartmentRepository();
