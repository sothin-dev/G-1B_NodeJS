"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const permission_entity_1 = require("../entities/permission.entity");
class PermissionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(permission_entity_1.Permission));
    }
    async findAllPermission() {
        return await this.repo.find({
            order: {
                module: "ASC",
                name: "ASC",
            },
        });
    }
}
exports.default = new PermissionRepository;
