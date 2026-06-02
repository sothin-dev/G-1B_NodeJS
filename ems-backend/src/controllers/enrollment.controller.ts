// src/controllers/enrollment.controller.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../core/errors/app-error'
import { EnrollmentService } from '../services/enrollment.service'

const enrollmentService = new EnrollmentService()

export const enroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = req.params.id
    const semesterId = req.body.semesterId
    const courseIds = Array.isArray(req.body.courseIds)
      ? req.body.courseIds
      : req.body.courseId
      ? [req.body.courseId]
      : []
    const result = await enrollmentService.enroll(studentId, semesterId, courseIds)
    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}