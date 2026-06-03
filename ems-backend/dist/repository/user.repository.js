"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const user_entity_1 = require("../entities/user.entity");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(user_entity_1.User));
    }
    async findByEmail(email) {
        return await this.repo.findOne({
            where: {
                email,
            },
        });
    }
    async Deactivate(userId) {
        return await this.repo.update({ id: userId }, { is_active: false });
    }
    async Reactivate(userId) {
        return await this.repo.update({ id: userId }, { is_active: true });
    }
    async ResetPassword(userId, hashedPassword) {
        return await this.repo.update({ id: userId }, { password: hashedPassword });
    }
}
exports.default = new UserRepository();
