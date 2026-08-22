import { Router } from 'express';
import activityLogController from '../controllers/activity-log.controller';
import authMiddleware from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Roles } from '../constants/roles';

const router = Router();

router.get(
  '/',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN),
  activityLogController.listLogs
);

export default router;
