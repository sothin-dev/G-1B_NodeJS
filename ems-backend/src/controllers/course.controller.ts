import { Request, Response, NextFunction } from "express";
import courseService from "../services/course.service";
import { successResponse } from "../utils/api-response";

class CourseController {
    /**
     * list all courses
     */
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = req.query.departmentId as string ;
      const teacherId = req.query.teacherId as string ;
      const semesterId = req.query.semesterId as string ;

      const courses = await courseService.listCourses({
        departmentId,
        teacherId,
        semesterId,
      });

      return successResponse(res, "Courses retrieved", courses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Course 
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
        const course = courseService.create(req.body);
        return successResponse(res, "The course is created successfully", course, 201)
    } catch (error) {
        next(error)
    }
  }
}

export default new CourseController();
