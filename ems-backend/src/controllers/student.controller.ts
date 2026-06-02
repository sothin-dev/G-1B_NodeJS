import { Request, Response, NextFunction } from "express";

import studentService from "../services/student.service";

import { successResponse } from "../utils/api-response";

class StudentController {
  /**
   * Get all students
   */
  getAllStudents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const data = await studentService.getAllStudents();
      return successResponse(res, "List of Students", data);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create student
   */
  createStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const student = await studentService.createStudent(req.body);
      return successResponse(res, "Student created successfully", student, 201);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Show detail student information
   */
  showStudent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const student = await studentService.showStudent(req.params.id);
      return successResponse(res, "Student detail information", student);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Student enrollment history
   */
  getStudentEnrollmentHistory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const history = await studentService.getStudentEnrollmentHistory(
        req.params.id,
      );
      return successResponse(res, "Student enrollment history", history);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all grades for a student across semesters
   */
  getStudentGrades = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const grades = await studentService.getStudentGrades(req.params.id);
      return successResponse(res, "Student grades retrieved", grades);
    } catch (error) {
      next(error);
    }
  };
}

export default new StudentController();