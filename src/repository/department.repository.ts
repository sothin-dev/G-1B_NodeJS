import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Department } from "../entities/department.entity";

class DepartmentRepository extends BaseRepository<Department> {
  constructor() {
    super(AppDataSource.getRepository(Department));
  }

  async findByCode(code: string) {
    return this.findOne({ code });
  }

  async findByIdWithRelations(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["courses", "teachers"],
    });
  }
}

export default new DepartmentRepository();
