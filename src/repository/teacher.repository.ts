import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Teacher } from "../entities/teacher.entity";

class TeacherRepository extends BaseRepository<Teacher> {
  constructor() {
    super(
      AppDataSource.getRepository(Teacher)
    );
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["user", "department"],
    });
  }

  async findByUserId(userId: string) {
    return this.repo.findOne({
      where: [
        { user: { id: userId } },
        { userId: userId },
      ],
      relations: ["user", "department", "courses"],
    });
  }
}

export default new TeacherRepository();