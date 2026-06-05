"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const role_entity_1 = require("../entities/role.entity");
const base_repository_1 = require("./base.repository");
class RoleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(role_entity_1.Role));
    }
    async findByName(name) {
        return this.findOne({
            name,
        });
    }
    async findRoleWithPermissions(id) {
        return this.repo.findOne({
            where: {
                id,
            },
            relations: {
                rolePermissions: {
                    permission: true,
                },
            },
        });
    }
}
exports.default = new RoleRepository();
