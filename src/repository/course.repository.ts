import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Course } from "../entities/course.entity";
import { EnrollmentCourse } from "../entities/enrollment-course.entity";

class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(AppDataSource.getRepository(Course));
  }

  async listCourses(filters: {
    search?: string;
    departmentId?: string;
    teacherId?: string;
    semesterId?: string;
  }) {
    const qb = this.repo
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.department", "department")
      .leftJoinAndSelect("course.teacher", "teacher")
      .leftJoinAndSelect("teacher.user", "teacherUser")
      .leftJoinAndSelect("course.schedules", "schedules")
      .leftJoinAndSelect("course.enrollmentCourses", "enrollmentCourses")
      .leftJoinAndSelect("enrollmentCourses.enrollment", "enrollment")
      .leftJoinAndSelect("enrollment.semester", "semester");

    if (filters.search) {
      qb.andWhere(
        "(course.code LIKE :search OR course.name LIKE :search)",
        { search: `%${filters.search}%` }
      );
    }

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

    const courses = await qb.getMany();
    return courses.map(c => ({
      ...c,
      enrolledCount: c.enrollmentCourses ? c.enrollmentCourses.length : 0,
    }));
  }

  async findByCode(code: string) {
    return this.findOne({
      code,
    });
  }

  async findWithRelations(id: string) {
    return this.repo.findOne({
      where: {
        id,
      },
      relations: [
        "department",
        "teacher",
        "teacher.user",
        "schedules",
      ],
    });
  }

  async saveCourse(course: Course) {
    return this.repo.save(course);
  }
}

export default new CourseRepository();
