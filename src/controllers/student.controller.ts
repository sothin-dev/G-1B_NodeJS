import { Request, Response, NextFunction } from "express";

import studentService from "../services/student.service";

import { successResponse } from "../utils/api-response";
import studentRepository from "../repository/student.repository";
import { AppError } from "../core/errors/app-error";

type AuthenticatedRequest = Request & {
  user?: {
    id?: string;
    role?: string;
  };
};

class StudentController {
  private async assertStudentCanAccess(req: AuthenticatedRequest, studentId: string) {
    if (req.user?.role !== "STUDENT") {
      return;
    }

    if (!req.user.id) {
      throw new AppError("Unauthorized", 401);
    }

    const student = await studentRepository.findByUserId(req.user.id);

    if (!student) {
      throw new AppError("Student profile not found for this account", 404);
    }

    if (student.id !== studentId) {
      throw new AppError("Forbidden", 403);
    }
  }

  async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAllStudents({
        search: req.query.search as string | undefined,
        departmentId: req.query.departmentId as string | undefined,
        status: req.query.status as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
      });

      if (data && typeof data === 'object' && 'items' in data) {
        return res.status(200).json({
          success: true,
          message: "List of Students",
          data: data.items,
          meta: data.meta,
        });
      }

      return successResponse(res, "List of Students", data);
    } catch (error) {
      next(error);
    }
  }

  async createStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.createStudent(req.body);
      return successResponse(res, "Student created successfully", student, 201);
    } catch (error) {
      next(error);
    }
  }

  async showStudent(req: Request, res: Response, next: NextFunction) {
    try {
      await this.assertStudentCanAccess(req as AuthenticatedRequest, req.params.id);
      const student = await studentService.showStudent(req.params.id);
      return successResponse(res, "Student detail information", student);
    } catch (error) {
      next(error);
    }
  }

  async getStudentEnrollmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      await this.assertStudentCanAccess(req as AuthenticatedRequest, req.params.id);
      const history = await studentService.getStudentEnrollmentHistory(req.params.id);
      return successResponse(res, "Student enrollment history", history);
    } catch (error) {
      next(error);
    }
  }

  async getStudentGrades(req: Request, res: Response, next: NextFunction) {
    try {
      await this.assertStudentCanAccess(req as AuthenticatedRequest, req.params.id);
      const grades = await studentService.getStudentGrades(req.params.id);
      return successResponse(res, "Student grades retrieved", grades);
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();
