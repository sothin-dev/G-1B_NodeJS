import { AppDataSource } from "../config/database";
import { DeepPartial } from "typeorm";

import { RolePermission } from "../entities/role_permission.entity";

import { BaseRepository } from "./base.repository";

class RolePermissionRepository
  extends BaseRepository<RolePermission> {

  constructor() {
    super(
      AppDataSource.getRepository(
        RolePermission
      )
    );
  }

  async findByRoleId(
    roleId: string
  ) {
    return this.repo.find({
      where: {
        role_id: roleId
      }
    });
  }

  async createMany(
    data: DeepPartial<RolePermission>[]
  ) {
    return this.repo.save(data);
  }

  async deleteRolePermission(
    roleId: string,
    permissionId: string
  ) {
    return this.repo.delete({
      role_id: roleId,
      permission_id: permissionId
    });
  }
}

export default new RolePermissionRepository();