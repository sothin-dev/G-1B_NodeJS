import { Request, Response, NextFunction } from "express";

import teacherService from "../services/teacher.service";
import { successResponse } from "../utils/api-response";

class TeacherController {
  async getAllTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.getAllTeachers(req.query.departmentId as string | undefined);
      return successResponse(res, "Teachers retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async createTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.createTeacher(req.body);
      return successResponse(res, "Teacher created successfully", data, 201);
    } catch (error) {
      next(error);
    }
  }

  async showTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.showTeacher(req.params.id);
      return successResponse(res, "Teacher retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async updateTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.updateTeacher(req.params.id, req.body);
      return successResponse(res, "Teacher updated", data);
    } catch (error) {
      next(error);
    }
  }

  async deleteTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.deleteTeacher(req.params.id);
      return successResponse(res, data.message);
    } catch (error) {
      next(error);
    }
  }

  async listTeacherCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await teacherService.listTeacherCourses(req.params.id);
      return successResponse(res, "Teacher courses", data);
    } catch (error) {
      next(error);
    }
  }
}

export default new TeacherController();
