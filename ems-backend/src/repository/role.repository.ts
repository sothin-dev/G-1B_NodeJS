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
}

export default new RoleRepository();