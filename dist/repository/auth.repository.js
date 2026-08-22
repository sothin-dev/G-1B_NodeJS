"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const user_entity_1 = require("../entities/user.entity");
const base_repository_1 = require("./base.repository");
class AuthRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(user_entity_1.User));
    }
    async findByEmail(email) {
        return this.repo.findOne({
            where: {
                email,
            },
            relations: {
                role: true,
            },
        });
    }
    async findByIdWithRole(id) {
        return this.repo.findOne({
            where: { id },
            relations: {
                role: {
                    rolePermissions: {
                        permission: true,
                    },
                },
                student: {
                    department: true,
                },
                teacher: {
                    department: true,
                },
            },
        });
    }
    async updateRefreshToken(id, token) {
        return this.repo.update({ id }, { refreshToken: token });
    }
}
exports.default = new AuthRepository();
