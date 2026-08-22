"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const user_entity_1 = require("../entities/user.entity");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(user_entity_1.User));
    }
    async Deactivate(userId) {
        return await this.repo.update({ id: userId }, { isActive: false });
    }
    async Reactivate(userId) {
        return await this.repo.update({ id: userId }, { isActive: true });
    }
    async ResetPassword(userId, hashedPassword) {
        return await this.repo.update({ id: userId }, { password: hashedPassword });
    }
    async searchUsers(params = {}) {
        const qb = this.repo
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.role", "role")
            .leftJoinAndSelect("user.student", "student")
            .leftJoinAndSelect("user.teacher", "teacher")
            .orderBy("user.created_at", "DESC");
        if (params.search) {
            qb.andWhere("(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)", { search: `%${params.search}%` });
        }
        if (params.role) {
            qb.andWhere("(role.name = :role OR role.id = :role)", { role: params.role });
        }
        if (params.is_active !== undefined && params.is_active !== '') {
            const active = params.is_active === 'true' || params.is_active === true;
            qb.andWhere("user.isActive = :active", { active });
        }
        if (params.page && params.limit) {
            const page = Math.max(1, Number(params.page));
            const limit = Math.max(1, Number(params.limit));
            qb.skip((page - 1) * limit).take(limit);
            const [items, totalItems] = await qb.getManyAndCount();
            return {
                items,
                meta: {
                    totalItems,
                    currentPage: page,
                    itemsPerPage: limit,
                },
            };
        }
        const items = await qb.getMany();
        return items;
    }
}
exports.default = new UserRepository();
