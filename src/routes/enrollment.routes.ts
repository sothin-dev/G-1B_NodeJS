import { Router } from 'express';
import enrollmentController from '../controllers/enrollment.controller';
import authMiddleware from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Roles } from '../constants/roles';

const router = Router();

router.get(
  '/',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  enrollmentController.listEnrollments,
);

router.post(
  '/',
  authMiddleware,
  authorizeRoles(Roles.STUDENT),
  enrollmentController.createEnrollment,
);

router.get(
  '/my-courses',
  authMiddleware,
  authorizeRoles(Roles.STUDENT),
  enrollmentController.getMyCourses,
);

router.post(
  '/validate',
  authMiddleware,
  authorizeRoles(Roles.STUDENT),
  enrollmentController.validateSelection,
);

router.get(
  '/:id',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.STUDENT),
  enrollmentController.getEnrollment,
);

router.patch(
  '/:id/approve',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  enrollmentController.approveEnrollment,
);

router.patch(
  '/:id/reject',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  enrollmentController.rejectEnrollment,
);

router.patch(
  '/:id/cancel',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.STUDENT),
  enrollmentController.cancelEnrollment,
);

router.get(
  '/:id/courses',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  enrollmentController.getEnrollmentCourses,
);

router.post(
  '/bulk-approve',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN),
  enrollmentController.bulkApprove,
);

export default router;
