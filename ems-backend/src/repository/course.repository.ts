import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Course } from "../entities/course.entity";

class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(AppDataSource.getRepository(Course));
  }

  async listCourses(filters: {
    departmentId?: string;
    teacherId?: string;
    semesterId?: string;
  }) {
    const qb = this.repo
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
      ],
    });
  }

}

export default new CourseRepository();
