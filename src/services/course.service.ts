import "dotenv/config";
import courseRepository from "../repository/course.repository";
import teacherRepository from "../repository/teacher.repository";
import departmentRepository from "../repository/department.repository";
import { CreateCourseDto } from "../dto/createCourse.dto";
import { UpdateCourseDto } from "../dto/updateCourse.dto";

import { AppError } from "../core/errors/app-error";
import { Course } from "../entities/course.entity";
import enrollmentCourseRepository from "../repository/enrollment-course.repository";

class CourseService {
  async listCourses(filters: {
    departmentId?: string;
    teacherId?: string;
    semesterId?: string;
  }) {
    return courseRepository.listCourses(filters);
  }

  async getCourseDetails(id: string) {
    const course = await courseRepository.findWithRelations(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course;
  }

  async updateCourse(id: string, data: UpdateCourseDto) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    if (data.teacher_id) {
      const teacher = await teacherRepository.findById(data.teacher_id);
      if (!teacher) {
        throw new AppError("Teacher not found", 404);
      }
      course.teacher = teacher;
    }

    if (data.name !== undefined) {
      course.name = data.name;
    }

    if (data.credit !== undefined) {
      course.credit = data.credit;
    }

    if (data.capacity !== undefined) {
      course.capacity = data.capacity;
    }

    return courseRepository.saveCourse(course);
  }

  async deleteCourse(id: string) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const enrolledCount = await enrollmentCourseRepository.courseEnrollmentCount(id);

    if (enrolledCount > 0) {
      throw new AppError("Cannot delete course with enrolled students", 400);
    }

    await courseRepository.delete(id);

    return { message: "Course deleted successfully" };
  }

  async listCourseStudents(id: string) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return enrollmentCourseRepository.listCourseStudents(id);
  }

  async listCourseSchedules(id: string) {
    const course = await courseRepository.findWithRelations(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    return course.schedules || [];
  }

  async create(data: CreateCourseDto) {
    const existing = await courseRepository.findByCode(data.code);

    if (existing) {
      throw new AppError("Course code already exists", 409);
    }

    const department = await departmentRepository.findById(data.department_id);

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    const teacher = await teacherRepository.findById(data.teacher_id);

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
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
