import { Request, Response, NextFunction } from "express";
import courseService from "../services/course.service";
import { successResponse } from "../utils/api-response";

class CourseController {
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const departmentId =
        (req.query.departmentId as string) || (req.query.deptId as string);
      const teacherId =
        (req.query.teacherId as string) || (req.query.teacher as string);
      const semesterId =
        (req.query.semesterId as string) || (req.query.semester as string);

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
}

export default new CourseController();
