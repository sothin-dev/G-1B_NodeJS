"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const role_permission_entity_1 = require("../entities/role_permission.entity");
const base_repository_1 = require("./base.repository");
class RolePermissionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(role_permission_entity_1.RolePermission));
    }
    async findByRoleId(roleId) {
        return this.repo.find({
            where: {
                role_id: roleId,
            },
        });
    }
    async createMany(data) {
        return this.repo.save(data);
    }
    async deleteRolePermission(roleId, permissionId) {
        return this.repo.delete({
            role_id: roleId,
            permission_id: permissionId,
        });
    }
    async findOneByRoleAndPermission(roleId, permissionId) {
        return this.repo.findOne({
            where: {
                role_id: roleId,
                permission_id: permissionId,
            },
        });
    }
}
exports.default = new RolePermissionRepository();
