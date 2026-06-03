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
}
exports.default = new RoleRepository();
