import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/role.middleware'
import { Roles } from '../constants/roles'
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  updateDepartment,
} from '../controllers/department.controller'

const router = Router()

router.post('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), createDepartment)
router.get('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), listDepartments)
router.get('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), getDepartment)
router.patch('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), updateDepartment)
router.delete('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), deleteDepartment)

export default router
