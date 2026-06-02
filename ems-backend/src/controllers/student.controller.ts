import { Request, Response, NextFunction } from "express";

import studentService from "../services/student.service";
import authService from "../services/auth.service";

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
            const data = await studentService.getAllStudent();
            return successResponse(res, "List of Students", data)
        } catch (error) {
            next(error)
        }
    }


    /**
     * Create student
     */
    createStudent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const student = await authService.register(req.body);
            return successResponse(res, "Student Created successfully", student, 201)
        } catch(error) {
            next(error)
        }
    }

    /**
     * show detail student information
     */
    showStudent = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            const student = await studentService.showStudent(req.params.id)
            return successResponse(res, "Student detail infromation", student)
        } catch(error) {
            next(error)
        }
    }
}

export default new StudentController;