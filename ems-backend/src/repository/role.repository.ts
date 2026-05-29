import { AppDataSource } from "../config/database";
import { Role } from "../entities/role.entity";
import { BaseRepository } from "./base.repository";

class RoleRepository extends BaseRepository<Role> {

  constructor() {
    super(
      AppDataSource.getRepository(Role)
    );
  }

  async findByName(name: string) {
    return this.findOne({
      name,
    });
  }
}

export default new RoleRepository();