import { Router } from 'express'
import authRouter from './auth.routes'
import enrollmentRouter from './enrollment.routes'
import departmentRouter from './department.routes'
import semesterRouter from './semester.routes'
import teacherRouter from './teacher.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/enrollments', enrollmentRouter)
router.use('/departments', departmentRouter)
router.use('/semesters', semesterRouter)
router.use('/teachers', teacherRouter)

export default router