import "dotenv/config";
import courseRepository from "../repository/course.repository";
import teacherRepository from "../repository/teacher.repository";
import departmentRepository from "../repository/department.repository";
import { CreateCourseDto } from "../dto/createCourse.dto";

import { AppError } from "../core/errors/app-error";

class CourseService {
  async listCourses(filters: {
    departmentId?: string;
    teacherId?: string;
    semesterId?: string;
  }) {
    return courseRepository.listCourses(filters);
  }

   async create(data: CreateCourseDto) {
    const existing =
      await courseRepository.findByCode(
        data.code
      );

    if (existing) {
      throw new AppError(
        "Course code already exists",
        409
      );
    }

    const department =
      await departmentRepository.findById(
        data.department_id
      );

    if (!department) {
      throw new AppError(
        "Department not found",
        404
      );
    }

    const teacher =
      await teacherRepository.findById(
        data.teacher_id
      );

    if (!teacher) {
      throw new AppError(
        "Teacher not found",
        404
      );
    }

    return courseRepository.create({
      name: data.name,
      code: data.code,
      credit: data.credit,
      capacity: data.capacity,
      department,
      teacher,
    });
  }
}

export default new CourseService();
