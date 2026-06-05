import "dotenv/config";
import { AppError } from "../core/errors/app-error";

import roleRepository from "../repository/role.repository";
import rolePermissionRepository from "../repository/role-permission.repository";
import permissionRepository from "../repository/permission.repository";

import { CreateRole } from "../dto/createRole.dto";
import { UpdateRole } from "../dto/updateRole.dto";

class RoleService {
  /**
   * Get all role for admin and super admin
   */
  async getAllRoles() {
    const roles = await roleRepository.findAll();
    return roles;
  }

  /**
   * Create role (only admin and super admi can acces)
   */
  async createRole(data: CreateRole) {
    const existingRole = await roleRepository.findByName(data.name);
    if (existingRole) {
      throw new AppError("this role is alread created", 409);
    }

    const role = await roleRepository.create({
      name: data.name,
    });

    return role;
  }

  /**
   * get role with permission assigned
   */
  async getRoleWithPermissions(roleId: string) {
    const role = await roleRepository.findRoleWithPermissions(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return role;
  }

  /**
   * update role name
   */
  async updateRole(roleId: string, data: UpdateRole) {
    const existingRole = await roleRepository.findById(roleId);

    if (!existingRole) {
      throw new AppError("This role is not found", 404);
    }

    const role = await roleRepository.update(roleId, { name: data.name });

    return role;
  }

  /**
   * Asign one or more permission to a role by role id
   */
  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const existing = await rolePermissionRepository.findByRoleId(roleId);

    const existingIds = existing.map((p) => p.permission_id);

    const newPermissions = permissionIds.filter(
      (id) => !existingIds.includes(id),
    );

    const payload = newPermissions.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    return await rolePermissionRepository.createMany(payload);
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: string, permissionId: string) {
    const existing = await rolePermissionRepository.findOneByRoleAndPermission(
      roleId,
      permissionId,
    );

    if (!existing) {
      throw new AppError("Permission not assigned to role", 404);
    }

    await rolePermissionRepository.deleteRolePermission(roleId, permissionId);

    return true;
  }
}

export default new RoleService();
