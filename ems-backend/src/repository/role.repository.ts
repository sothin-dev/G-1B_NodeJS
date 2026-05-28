import { AppDataSource } from "../config/database";
import { Role } from "../entities/role.entity";
import { DeepPartial } from "typeorm";

class RoleRepository {

  private repo =
    AppDataSource.getRepository(Role);

  async findByName(name: string) {
    return this.repo.findOne({
      where: { name }
    });
  }

  async findById(id: string) {
    return await this.repo.findOne({
      where: { id }
    });
  }

  async create(data: DeepPartial<Role>) {
    const role = this.repo.create(data);
    return this.repo.save(role);
  }
}

export default new RoleRepository();