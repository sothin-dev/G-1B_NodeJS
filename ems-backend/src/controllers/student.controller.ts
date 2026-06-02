import { Request, Response, NextFunction } from "express";

import studentService from "../services/student.service";

import { successResponse } from "../utils/api-response";

class StudentController {
  async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await studentService.getAllStudents();
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
      const student = await studentService.showStudent(req.params.id);
      return successResponse(res, "Student detail information", student);
    } catch (error) {
      next(error);
    }
  }

  async getStudentEnrollmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const history = await studentService.getStudentEnrollmentHistory(req.params.id);
      return successResponse(res, "Student enrollment history", history);
    } catch (error) {
      next(error);
    }
  }

  async getStudentGrades(req: Request, res: Response, next: NextFunction) {
    try {
      const grades = await studentService.getStudentGrades(req.params.id);
      return successResponse(res, "Student grades retrieved", grades);
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentController();