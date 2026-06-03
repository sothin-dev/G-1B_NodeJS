import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorizeRoles } from '../middleware/role.middleware'
import { Roles } from '../constants/roles'
import {
  createSemester,
  deleteSemester,
  getSemester,
  listSemesters,
  updateSemester,
} from '../controllers/semester.controller'

const router = Router()

router.post('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), createSemester)
router.get('/', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), listSemesters)
router.get('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), getSemester)
router.patch('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), updateSemester)
router.delete('/:id', authMiddleware, authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN), deleteSemester)

export default router
