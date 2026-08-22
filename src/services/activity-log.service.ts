import { AppDataSource } from '../config/database';
import { ActivityLog } from '../entities/activity-log.entity';

const logRepo = () => AppDataSource.getRepository(ActivityLog);

export class ActivityLogService {
  async listLogs(filters: {
    search?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const qb = logRepo()
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .orderBy('log.created_at', 'DESC');

    if (filters.search) {
      qb.andWhere(
        '(user.email LIKE :search OR log.action LIKE :search OR log.metadata LIKE :search)',
        { search: `%${filters.search}%` }
      );
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

  async logActivity(userId: string | null | undefined, action: string, metadata?: any) {
    try {
      const repo = logRepo();
      const log = repo.create({
        userId: userId || undefined,
        action,
        metadata: metadata ? metadata : undefined,
      });
      return await repo.save(log);
    } catch (err) {
      console.error('Failed to write activity log:', err);
    }
  }
}

export default new ActivityLogService();
