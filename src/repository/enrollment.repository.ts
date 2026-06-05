import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Enrollment } from "../entities/enrollment.entity";

class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super(AppDataSource.getRepository(Enrollment));
  }

  async getEnrollmentHistory(studentId: string) {
    return this.repo.find({
      where: {
        student: {
          id: studentId,
        },
      },
      relations: [
        "semester",
        "enrollmentCourses",
        "enrollmentCourses.course",
      ],
      order: {
        created_at: "DESC",
      },
    });
  }
}

export default new EnrollmentRepository();