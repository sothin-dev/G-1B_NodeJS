import { Request, Response, NextFunction } from "express";
import { EnrollmentService } from "../services/enrollment.service";
import { errorResponse, successResponse } from "../utils/api-response";
import studentRepository from "../repository/student.repository";
import activityLogService from "../services/activity-log.service";
import { AppError } from "../core/errors/app-error";

interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    [key: string]: any;
  };
}

const enrollmentService = new EnrollmentService();

class EnrollmentController {
  private async resolveStudentId(req: AuthenticatedRequest): Promise<string | null> {
    if (req.user?.role === 'STUDENT' && req.user?.id) {
      const student = await studentRepository.findByUserId(req.user.id);
      return student ? student.id : null;
    }
    return (req.body?.studentId || req.query?.studentId) as string || null;
  }

  async listEnrollments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let studentId = req.query.studentId as string | undefined;
      if (req.user?.role === 'STUDENT' && req.user?.id) {
        studentId = await this.resolveStudentId(req) || undefined;
      }

      const result = await enrollmentService.listEnrollments({
        studentId,
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
      const studentId = await this.resolveStudentId(req);

      if (!studentId) {
        return errorResponse(res, "Student profile not found for this account", 400);
      }

      const semesterId = req.body.semesterId;
      const courseIds = Array.isArray(req.body.courseIds)
        ? req.body.courseIds
        : req.body.courseId
          ? [req.body.courseId]
          : [];

      const result = await enrollmentService.enroll(studentId, semesterId, courseIds);
      await activityLogService.logActivity(req.user?.id, "ENROLLMENT_SUBMITTED", {
        enrollmentId: result.id,
        courseIds,
      });
      return successResponse(res, "Enrolled successfully", result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.getEnrollment(req.params.id);
      if (req.user?.role === 'STUDENT') {
        const studentId = await this.resolveStudentId(req);
        if (!studentId) {
          throw new AppError("Student profile not found for this account", 404);
        }

        if (result.studentId !== studentId) {
          throw new AppError("Forbidden", 403);
        }
      }

      return successResponse(res, "Enrollment details", result);
    } catch (error) {
      next(error);
    }
  }

  async approveEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.approve(req.params.id);
      await activityLogService.logActivity(req.user?.id, "ENROLLMENT_APPROVED", {
        enrollmentId: req.params.id,
      });
      return successResponse(res, "Enrollment approved", result);
    } catch (error) {
      next(error);
    }
  }

  async rejectEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await enrollmentService.reject(req.params.id, req.body?.reason);
      await activityLogService.logActivity(req.user?.id, "ENROLLMENT_REJECTED", {
        enrollmentId: req.params.id,
        reason: req.body?.reason,
      });
      return successResponse(res, "Enrollment rejected", result);
    } catch (error) {
      next(error);
    }
  }

  async cancelEnrollment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      let studentId: string | undefined = undefined;
      if (req.user?.role === 'STUDENT') {
        const resolved = await this.resolveStudentId(req);
        if (!resolved) return errorResponse(res, "Student not found", 404);
        studentId = resolved;
      }

      const result = await enrollmentService.cancel(req.params.id, studentId);
      await activityLogService.logActivity(req.user?.id, "ENROLLMENT_CANCELLED", {
        enrollmentId: req.params.id,
      });
      return successResponse(res, "Enrollment cancelled", result);
    } catch (error) {
      next(error);
    }
  }

  async getMyCourses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        return errorResponse(res, "Unauthorized", 401);
      }

      const student = await studentRepository.findByUserId(req.user.id);
      if (!student) {
        return successResponse(res, "No student profile found", []);
      }

      const result = await enrollmentService.getMyCourses(student.id, req.query.semesterId as string | undefined);
      return successResponse(res, "Student enrolled courses", result);
    } catch (error) {
      next(error);
    }
  }

  async validateSelection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const studentId = await this.resolveStudentId(req);

      if (!studentId) {
        return errorResponse(res, "Student profile required", 400);
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
      await activityLogService.logActivity(req.user?.id, "ENROLLMENTS_BULK_APPROVED", {
        count: (req.body.enrollmentIds ?? []).length,
      });
      return successResponse(res, "Enrollments approved", result);
    } catch (error) {
      next(error);
    }
  }
}

const enrollmentController = new EnrollmentController();
export const enroll = enrollmentController.createEnrollment.bind(enrollmentController);
export default enrollmentController;
