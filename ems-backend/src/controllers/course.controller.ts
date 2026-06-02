import { Request, Response, NextFunction } from "express";
import courseService from "../services/course.service";
import { successResponse } from "../utils/api-response";

class CourseController {
  /**
   * list all courses
   */
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId = req.query.departmentId as string;
      const teacherId = req.query.teacherId as string;
      const semesterId = req.query.semesterId as string;

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
   * Get course details including schedules
   */
  async getCourseDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.getCourseDetails(req.params.id);
      return successResponse(res, "Course details retrieved", course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update course info
   */
  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.updateCourse(req.params.id, req.body);
      return successResponse(res, "Course updated successfully", course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await courseService.deleteCourse(req.params.id);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List enrolled students for a course
   */
  async listCourseStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await courseService.listCourseStudents(req.params.id);
      return successResponse(res, "Course students retrieved", students);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get schedule slots for a course
   */
  async listCourseSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const schedules = await courseService.listCourseSchedules(req.params.id);
      return successResponse(res, "Course schedules retrieved", schedules);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create Course
   */
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await courseService.create(req.body);
      return successResponse(res, "The course is created successfully", course, 201);
    } catch (error) {
      next(error);
    }
  }
}

export default new CourseController();
