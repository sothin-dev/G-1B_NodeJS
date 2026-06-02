import { Router } from 'express'
import authRouter from './auth.routes'
import userRouter from './user.routes'
import rolePermissionRouter from './roles-permission.routes'
import permissionRouter from './permission.routes'
import studentRouter from './student.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/roles', rolePermissionRouter)
router.use('/permissions', permissionRouter)
router.use('/students', studentRouter)

export default router