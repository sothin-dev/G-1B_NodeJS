// src/routes/enrollment.routes.ts
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/role.middleware'
import { Roles } from '../constants/roles'
import {
  enroll,
  list,
  getOne,
  myCourses,
  validateEnrollment,
  getCourses,
  bulkApprove,
  cancel,
  approve,
  reject,
  history,
} from '../controllers/enrollment.controller'

const router = Router()

// Student routes
router.post('/', authMiddleware, authorizeRoles(Roles.STUDENT), enroll)
router.post('/enroll', authMiddleware, authorizeRoles(Roles.STUDENT), enroll)
router.post('/validate', authMiddleware, authorizeRoles(Roles.STUDENT), validateEnrollment)
router.get('/my-courses', authMiddleware, authorizeRoles(Roles.STUDENT), myCourses)
router.get('/history', authMiddleware, authorizeRoles(Roles.STUDENT), history)
router.patch('/:id/cancel', authMiddleware, authorizeRoles(Roles.STUDENT, Roles.ADMIN, Roles.SUPER_ADMIN), cancel)

// Admin routes
router.get('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), list)
router.get('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.STUDENT), getOne)
router.get('/:id/courses', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), getCourses)
router.post('/bulk-approve', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), bulkApprove)
router.patch('/:id/approve', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), approve)
router.patch('/:id/reject', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), reject)

export default router