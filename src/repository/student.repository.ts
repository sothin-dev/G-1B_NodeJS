import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Student } from "../entities/student.entity";

class StudentRepository extends BaseRepository<Student> {
  constructor() {
    super(AppDataSource.getRepository(Student));
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "department"],
    });
  }

  async findByUserId(userId: string) {
    return this.repo.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ["user"],
    });
  }
}

export default new StudentRepository();