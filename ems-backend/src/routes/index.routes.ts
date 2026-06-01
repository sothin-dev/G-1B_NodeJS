import { Router } from 'express'
import authRouter from './auth.routes'
import userRouter from './user.routes'
import rolePermissionRouter from './roles-permission.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/roles', rolePermissionRouter)

export default router