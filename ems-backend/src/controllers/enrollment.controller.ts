import { Request, Response, NextFunction } from "express";
import { EnrollmentService } from "../services/enrollment.service";
import { successResponse } from "../utils/api-response";

const enrollmentService = new EnrollmentService();

class EnrollmentController {
  async enroll(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.params.id;
      const semesterId = req.body.semesterId;
      const courseIds = Array.isArray(req.body.courseIds)
        ? req.body.courseIds
        : req.body.courseId
        ? [req.body.courseId]
        : [];

      const result = await enrollmentService.enroll(studentId, semesterId, courseIds);
      return successResponse(res, "Enrolled successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }
}

const enrollmentController = new EnrollmentController();
export const enroll = enrollmentController.enroll.bind(enrollmentController);
export default enrollmentController;
