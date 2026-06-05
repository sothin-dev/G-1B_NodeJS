import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { EnrollmentCourse } from "../entities/enrollment-course.entity";

class EnrollmentCourseRepository extends BaseRepository<EnrollmentCourse> {
  constructor() {
    super(AppDataSource.getRepository(EnrollmentCourse));
  }


  async listCourseStudents(courseId: string) {

    const records = await this.repo.find({
      where: {
        course: {
          id: courseId,
        },
      },
      relations: [
        "enrollment",
        "enrollment.student",
        "enrollment.student.user",
      ],
    });

    return records.map((record) => record.enrollment.student);
  }

  async courseEnrollmentCount(courseId: string) {

    return this.repo.count({
      where: {
        course: {
          id: courseId,
        },
      },
    });
  }

}

export default new EnrollmentCourseRepository();
