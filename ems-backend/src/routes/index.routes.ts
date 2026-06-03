import { Router } from 'express'
import authRouter from './auth.routes'
import userRouter from './user.routes'
import rolePermissionRouter from './roles-permission.routes'
import permissionRouter from './permission.routes'
import studentRouter from './student.routes'
import departmentRouter from './department.routes'
import courseRouter from './course.routes'
import scheduleRouter from './schedule.routes'
import semesterRouter from './semester.routes'
import enrollmentRouter from './enrollment.routes'
import gradeRouter from './grade.routes'
import teacherRouter from './teacher.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/roles', rolePermissionRouter)
router.use('/permissions', permissionRouter)
router.use('/students', studentRouter)
router.use('/departments', departmentRouter)
router.use('/courses', courseRouter)
router.use('/schedules', scheduleRouter)
router.use('/semesters', semesterRouter)
router.use('/enrollments', enrollmentRouter)
router.use('/grades', gradeRouter)
router.use('/teachers', teacherRouter)

export default router