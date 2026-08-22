"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const database_1 = require("../config/database");
const activity_log_entity_1 = require("../entities/activity-log.entity");
const logRepo = () => database_1.AppDataSource.getRepository(activity_log_entity_1.ActivityLog);
class ActivityLogService {
    async listLogs(filters) {
        const qb = logRepo()
            .createQueryBuilder('log')
            .leftJoinAndSelect('log.user', 'user')
            .orderBy('log.created_at', 'DESC');
        if (filters.search) {
            qb.andWhere('(user.email LIKE :search OR log.action LIKE :search OR log.metadata LIKE :search)', { search: `%${filters.search}%` });
        }
        if (filters.action) {
            qb.andWhere('log.action = :action', { action: filters.action });
        }
        if (filters.dateFrom) {
            qb.andWhere('log.created_at >= :dateFrom', { dateFrom: filters.dateFrom });
        }
        if (filters.dateTo) {
            qb.andWhere('log.created_at <= :dateTo', { dateTo: filters.dateTo });
        }
        return qb.getMany();
    }
    async logActivity(userId, action, metadata) {
        try {
            const repo = logRepo();
            const log = repo.create({
                userId: userId || undefined,
                action,
                metadata: metadata ? metadata : undefined,
            });
            return await repo.save(log);
        }
        catch (err) {
            console.error('Failed to write activity log:', err);
        }
    }
}
exports.ActivityLogService = ActivityLogService;
exports.default = new ActivityLogService();
