import { Request, Response, NextFunction } from 'express';
import activityLogService from '../services/activity-log.service';
import { successResponse } from '../utils/api-response';

class ActivityLogController {
  async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await activityLogService.listLogs({
        search: req.query.search as string | undefined,
        action: req.query.action as string | undefined,
        dateFrom: req.query.dateFrom as string | undefined,
        dateTo: req.query.dateTo as string | undefined,
      });
      return successResponse(res, 'Activity logs retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ActivityLogController();
