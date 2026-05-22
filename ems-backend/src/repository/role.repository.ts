import { AppDataSource } from "../config/database";
import { Role } from "../entities/role.entity";

class RoleRepository {

  private repo =
    AppDataSource.getRepository(Role);

  async findByName(name: string) {

    return this.repo.findOne({
      where: { name }
    });

  }

  async findById(id: number) {
    return await this.repo.findOne({
      where: { id }
    });
  };
}

export default new RoleRepository();