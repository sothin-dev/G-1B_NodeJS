import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Permission } from "../entities/permission.entity";

class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super(AppDataSource.getRepository(Permission));
  }

  async findAllPermission() {
    return await this.repo.find({
      order: {
        module: "ASC",
        name: "ASC",
      },
    });
  }
}



export default new PermissionRepository