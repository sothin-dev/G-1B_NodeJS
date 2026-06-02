import { Router } from 'express'
import authRouter from './auth.routes'
import departmentRouter from './department.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/departments', departmentRouter)

export default router
