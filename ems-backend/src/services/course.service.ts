import "dotenv/config";
import { AppDataSource } from "../config/database";
import { Course } from "../entities/course.entity";

class CourseService {
  async listCourses(filters: {
    departmentId?: string;
    teacherId?: string;
    semesterId?: string;
  }) {
    const courseRepo = AppDataSource.getRepository(Course);

    const qb = courseRepo
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.department", "department")
      .leftJoinAndSelect("course.teacher", "teacher")
      .leftJoinAndSelect("course.schedules", "schedules")
      .leftJoinAndSelect("course.enrollmentCourses", "enrollmentCourses")
      .leftJoinAndSelect("enrollmentCourses.enrollment", "enrollment")
      .leftJoinAndSelect("enrollment.semester", "semester");

    if (filters.departmentId) {
      qb.andWhere("course.departmentId = :departmentId", {
        departmentId: filters.departmentId,
      });
    }

    if (filters.teacherId) {
      qb.andWhere("course.teacherId = :teacherId", {
        teacherId: filters.teacherId,
      });
    }

    if (filters.semesterId) {
      qb.andWhere("semester.id = :semesterId", {
        semesterId: filters.semesterId,
      });
    }

    qb.orderBy("course.created_at", "DESC");
    qb.distinct(true);

    return qb.getMany();
  }
}

export default new CourseService();
