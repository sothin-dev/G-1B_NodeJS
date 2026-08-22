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
    search?: string;
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

  async updateCourse(id: string, data: any) {
    const course = await courseRepository.findById(id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const teacherId = data.teacherId || data.teacher_id;
    if (teacherId !== undefined) {
      if (teacherId) {
        const teacher = await teacherRepository.findById(teacherId);
        if (!teacher) {
          throw new AppError("Teacher not found", 404);
        }
        course.teacher = teacher;
        course.teacherId = teacher.id;
      } else {
        (course as any).teacher = null;
        (course as any).teacherId = null;
      }
    }

    const departmentId = data.departmentId || data.department_id;
    if (departmentId !== undefined) {
      if (departmentId) {
        const department = await departmentRepository.findById(departmentId);
        if (!department) {
          throw new AppError("Department not found", 404);
        }
        course.department = department;
        course.departmentId = department.id;
      } else {
        (course as any).department = null;
        (course as any).departmentId = null;
      }
    }

    if (data.name !== undefined) {
      course.name = data.name;
    }

    if (data.code !== undefined) {
      course.code = data.code;
    }

    const credits = data.credits !== undefined ? data.credits : data.credit;
    if (credits !== undefined) {
      course.credits = Number(credits);
    }

    if (data.capacity !== undefined) {
      course.capacity = Number(data.capacity);
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

  async create(data: any) {
    const existing = await courseRepository.findByCode(data.code);

    if (existing) {
      throw new AppError("Course code already exists", 409);
    }

    const departmentId = data.departmentId || data.department_id;
    let department = undefined;
    if (departmentId) {
      department = await departmentRepository.findById(departmentId);
      if (!department) {
        throw new AppError("Department not found", 404);
      }
    }

    const teacherId = data.teacherId || data.teacher_id;
    let teacher = undefined;
    if (teacherId) {
      teacher = await teacherRepository.findById(teacherId);
      if (!teacher) {
        throw new AppError("Teacher not found", 404);
      }
    }

    const credits = Number(data.credits !== undefined ? data.credits : (data.credit ?? 3));
    const capacity = Number(data.capacity ?? 30);

    return courseRepository.create({
      name: data.name,
      code: data.code,
      credits,
      capacity,
      department: department ? { id: department.id } : undefined,
      teacher: teacher ? { id: teacher.id } : undefined,
      departmentId: department ? department.id : undefined,
      teacherId: teacher ? teacher.id : undefined,
    });
  }
}

export default new CourseService();
