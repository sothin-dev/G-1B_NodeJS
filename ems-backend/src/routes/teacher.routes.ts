import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/role.middleware'
import { Roles } from '../constants/roles'
import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  updateTeacher,
} from '../controllers/teacher.controller'

const router = Router()

router.post('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), createTeacher)
router.get('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), listTeachers)
router.get('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), getTeacher)
router.patch('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), updateTeacher)
router.delete('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), deleteTeacher)

export default router
