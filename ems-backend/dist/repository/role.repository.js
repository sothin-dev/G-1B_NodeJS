"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const role_entity_1 = require("../entities/role.entity");
class RoleRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(role_entity_1.Role);
    }
    async findByName(name) {
        return this.repo.findOne({
            where: { name }
        });
    }
    async findById(id) {
        return await this.repo.findOne({
            where: { id }
        });
    }
    async create(data) {
        const role = this.repo.create(data);
        return this.repo.save(role);
    }
}
exports.default = new RoleRepository();
