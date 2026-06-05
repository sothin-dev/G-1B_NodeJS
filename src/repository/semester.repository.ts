import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Semester, SemesterStatus } from "../entities/semester.entity";

class SemesterRepository extends BaseRepository<Semester> {
  constructor() {
    super(AppDataSource.getRepository(Semester));
  }

  async findByNameAndYear(name: string, year: number) {
    return this.findOne({ name, year });
  }

  async findByStatus(status: SemesterStatus) {
    return this.findMany({ status });
  }

  async findByIdWithEnrollments(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["enrollments"],
    });
  }
}

export default new SemesterRepository();
