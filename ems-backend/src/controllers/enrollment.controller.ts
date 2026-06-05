import { Request, Response, NextFunction } from "express";
import { EnrollmentService } from "../services/enrollment.service";
import { errorResponse, successResponse } from "../utils/api-response";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    [key: string]: any;
  };
}

const enrollmentService = new EnrollmentService();

class EnrollmentController {
  async listEnrollments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.listEnrollments({
        studentId: req.query.studentId as string | undefined,
        semesterId: req.query.semesterId as string | undefined,
        status: req.query.status as string | undefined,
      });
      return successResponse(res, "List of enrollments", result);
    } catch (error) {
      next(error);
    }
  }

  async createEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = (req.user?.id && req.user.role === 'STUDENT')
        ? req.user.id
        : (req.body.studentId as string | undefined);

      if (!studentId) {
        return errorResponse(res, "Student ID is required", 400);
      }

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

  async getEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.getEnrollment(req.params.id);
      return successResponse(res, "Enrollment details", result);
    } catch (error) {
      next(error);
    }
  }

  async approveEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.approve(req.params.id);
      return successResponse(res, "Enrollment approved", result);
    } catch (error) {
      next(error);
    }
  }

  async rejectEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.reject(req.params.id, req.body?.reason);
      return successResponse(res, "Enrollment rejected", result);
    } catch (error) {
      next(error);
    }
  }

  async cancelEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.role === 'STUDENT'
        ? req.user.id
        : (req.body.studentId as string | undefined);

      if (!studentId) {
        return errorResponse(res, "Student ID is required", 400);
      }

      const result = await enrollmentService.cancel(req.params.id, studentId);
      return successResponse(res, "Enrollment cancelled", result);
    } catch (error) {
      next(error);
    }
  }

  async getMyCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.id;

      if (!studentId) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const result = await enrollmentService.getMyCourses(studentId, req.query.semesterId as string | undefined);
      return successResponse(res, "Student enrolled courses", result);
    } catch (error) {
      next(error);
    }
  }

  async validateSelection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = req.user?.role === 'STUDENT'
        ? req.user.id
        : (req.body.studentId as string | undefined);

      if (!studentId) {
        return errorResponse(res, "Student ID is required", 400);
      }

      const semesterId = req.body.semesterId;
      const courseIds = Array.isArray(req.body.courseIds) ? req.body.courseIds : [];

      const result = await enrollmentService.validateSelection(studentId, semesterId, courseIds);
      return successResponse(res, "Course selection is valid", result);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.getEnrollmentCourses(req.params.id);
      return successResponse(res, "Enrollment courses", result);
    } catch (error) {
      next(error);
    }
  }

  async bulkApprove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.bulkApprove(req.body.enrollmentIds ?? []);
      return successResponse(res, "Enrollments approved", result);
    } catch (error) {
      next(error);
    }
  }
}

const enrollmentController = new EnrollmentController();
export const enroll = enrollmentController.createEnrollment.bind(enrollmentController);
export default enrollmentController;
