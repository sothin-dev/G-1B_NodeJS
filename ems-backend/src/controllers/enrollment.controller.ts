import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { EnrollmentService } from '../services/enrollment.service'

const enrollmentService = new EnrollmentService()

export const enroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student_id = req.user.id
    const { semester_id, course_ids } = req.body

    if (!semester_id) {
      res.status(400).json({ success: false, message: 'semester_id is required' })
      return
    }

    if (!Array.isArray(course_ids) || course_ids.length === 0) {
      res.status(400).json({ success: false, message: 'course_ids must be a non-empty array' })
      return
    }

    const enrollment = await enrollmentService.enrollInCourses(student_id, Number(semester_id), course_ids)

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: {
        id: enrollment.id,
        status: enrollment.status,
        total_credits: enrollment.total_credits,
        student_id: enrollment.studentId,
        semester_id: enrollment.semesterId,
      }
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const list = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { student_id, semester_id, status, page = 1, limit = 10 } = req.query
    const filters = {
      student_id: student_id ? Number(student_id) : undefined,
      semester_id: semester_id ? Number(semester_id) : undefined,
      status: status as string,
      page: Number(page),
      limit: Number(limit),
    }

    const result = await enrollmentService.listEnrollments(filters)

    res.status(200).json({
      success: true,
      data: result.enrollments,
      meta: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(result.total / filters.limit),
      }
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getOne = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const role = req.user.role

    if (!id) {
      res.status(400).json({ success: false, message: 'Enrollment ID is required' })
      return
    }

    const enrollment = await enrollmentService.getEnrollmentById(Number(id), userId, role)
    res.status(200).json({ success: true, data: enrollment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const myCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student_id = req.user.id
    const { semester_id } = req.query

    const enrollments = await enrollmentService.getMyCourses(student_id, semester_id ? Number(semester_id) : undefined)

    res.status(200).json({ success: true, data: enrollments })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const history = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student_id = req.user.id
    const { semester_id, status, page = 1, limit = 10 } = req.query

    const filters = {
      semester_id: semester_id ? Number(semester_id) : undefined,
      status: status as string,
      page: Number(page),
      limit: Number(limit),
    }

    const result = await enrollmentService.getEnrollmentHistory(student_id, filters)

    res.status(200).json({
      success: true,
      data: result.enrollments,
      meta: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        total_pages: Math.ceil(result.total / filters.limit),
      },
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const validateEnrollment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student_id = req.user.id
    const { semester_id, course_ids } = req.body

    if (!semester_id) {
      res.status(400).json({ success: false, message: 'semester_id is required' })
      return
    }

    if (!Array.isArray(course_ids) || course_ids.length === 0) {
      res.status(400).json({ success: false, message: 'course_ids must be a non-empty array' })
      return
    }

    const validation = await enrollmentService.validateEnrollment(student_id, Number(semester_id), course_ids)
    res.status(200).json({ success: true, data: validation })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    if (!id) {
      res.status(400).json({ success: false, message: 'Enrollment ID is required' })
      return
    }

    const courses = await enrollmentService.getEnrollmentCourses(Number(id))
    res.status(200).json({ success: true, data: courses })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const bulkApprove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin_id = req.user.id
    const { enrollment_ids } = req.body

    if (!Array.isArray(enrollment_ids) || enrollment_ids.length === 0) {
      res.status(400).json({ success: false, message: 'enrollment_ids must be a non-empty array' })
      return
    }

    const enrollments = await enrollmentService.bulkApproveEnrollments(enrollment_ids, admin_id)
    res.status(200).json({ success: true, message: 'Enrollments approved successfully', data: enrollments })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const cancel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user.id
    const role = req.user.role
    const { id } = req.params

    if (!id) {
      res.status(400).json({ success: false, message: 'Enrollment ID is required' })
      return
    }

    await enrollmentService.cancelEnrollment(Number(id), user_id, role)
    res.status(200).json({
      success: true,
      message: 'Enrollment cancelled successfully',
      data: { enrollment_id: Number(id), status: 'CANCELLED' }
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const approve = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin_id = req.user.id
    const { id } = req.params

    if (!id) {
      res.status(400).json({ success: false, message: 'Enrollment ID is required' })
      return
    }

    const enrollment = await enrollmentService.approveEnrollment(Number(id), admin_id)
    res.status(200).json({ success: true, message: 'Enrollment approved successfully', data: enrollment })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const reject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const admin_id = req.user.id
    const { id } = req.params
    const { reason } = req.body

    if (!id) {
      res.status(400).json({ success: false, message: 'Enrollment ID is required' })
      return
    }

    const enrollment = await enrollmentService.rejectEnrollment(Number(id), admin_id, reason || 'No reason provided')
    res.status(200).json({
      success: true,
      message: 'Enrollment rejected successfully',
      data: enrollment,
    })
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message })
  }
}
