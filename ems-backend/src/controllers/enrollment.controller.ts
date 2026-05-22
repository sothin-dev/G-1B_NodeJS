// src/controllers/enrollment.controller.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../middleware/error.middleware'
import { EnrollmentService } from '../services/enrollment.service'

const enrollmentService = new EnrollmentService()

export const enroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const studentId = parseInt(req.params.id)
    const semesterId = req.body.semesterId;
    const courseId = req.body.courseId;
    const result = await enrollmentService.enroll(studentId, semesterId, courseId)
    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: result,
    })
  } catch (err) {
    next(err)
  }
}