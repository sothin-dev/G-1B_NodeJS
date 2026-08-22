import { Router } from 'express';
import gradeController from '../controllers/grade.controller';
import authMiddleware from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middleware';
import { Roles } from '../constants/roles';

const router = Router();

router.get(
  '/',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER, Roles.STUDENT),
  gradeController.listGrades,
);

router.post(
  '/',
  authMiddleware,
  authorizeRoles(Roles.TEACHER),
  gradeController.createGrade,
);

router.patch(
  '/bulk-upload',
  authMiddleware,
  authorizeRoles(Roles.TEACHER),
  gradeController.bulkUpload,
);

router.get(
  '/:id',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER, Roles.STUDENT),
  gradeController.getGrade,
);

router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles(Roles.TEACHER),
  gradeController.updateGrade,
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN),
  gradeController.deleteGrade,
);

router.patch(
  '/:id/publish',
  authMiddleware,
  authorizeRoles(Roles.TEACHER),
  gradeController.publishGrade,
);

router.get(
  '/course/:courseId',
  authMiddleware,
  authorizeRoles(Roles.SUPER_ADMIN, Roles.ADMIN, Roles.TEACHER),
  gradeController.getGradesByCourse,
);

export default router;
