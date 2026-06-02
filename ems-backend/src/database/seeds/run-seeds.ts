import { AppDataSource } from "../../config/database";

import { User } from "../../entities/user.entity";
import { Role } from "../../entities/role.entity";
import { Permission } from "../../entities/permission.entity";
import { RolePermission } from "../../entities/role_permission.entity";

import * as bcrypt from "bcryptjs";

async function seed() {
  await AppDataSource.initialize();

  const roleRepo =
    AppDataSource.getRepository(Role);

  const permissionRepo =
    AppDataSource.getRepository(Permission);

  const userRepo =
    AppDataSource.getRepository(User);

  const rolePermissionRepo =
    AppDataSource.getRepository(RolePermission);

  try {

    /*
    =====================
    ROLES
    =====================
    */

    const roleNames = [
      "SUPER_ADMIN",
      "ADMIN",
      "TEACHER",
      "STUDENT"
    ];

    const roles: Record<string, Role> = {};

    for (const name of roleNames) {

      let role =
        await roleRepo.findOne({
          where: { name }
        });

      if (!role) {
        role =
          await roleRepo.save(
            roleRepo.create({ name })
          );
      }

      roles[name] = role;
    }

    /*
    =====================
    PERMISSIONS
    =====================
    */

    const permissions = [
      // USERS
      { name: "create_user", module: "users" },
      { name: "update_user", module: "users" },
      { name: "delete_user", module: "users" },

      // STUDENTS
      { name: "create_student", module: "students" },
      { name: "update_student", module: "students" },
      { name: "delete_student", module: "students" },

      // COURSES
      { name: "create_course", module: "courses" },
      { name: "update_course", module: "courses" },
      { name: "delete_course", module: "courses" },

      // ENROLLMENTS
      { name: "approve_enrollment", module: "enrollments" },
      { name: "reject_enrollment", module: "enrollments" },

      // ROLES
      { name: "manage_roles", module: "roles" },

      // PERMISSIONS
      { name: "manage_permissions", module: "permissions" },
    ];

    const savedPermissions: Permission[] = [];

    for (const permission of permissions) {

      let existing =
        await permissionRepo.findOne({
          where: {
            name: permission.name
          }
        });

      if (!existing) {

        existing =
          await permissionRepo.save(
            permissionRepo.create(permission)
          );
      }

      savedPermissions.push(existing);
    }

    /*
    =====================
    SUPER ADMIN GETS ALL
    =====================
    */

    for (const permission of savedPermissions) {

      const exists =
        await rolePermissionRepo.findOne({
          where: {
            role_id: roles.SUPER_ADMIN.id,
            permission_id: permission.id
          }
        });

      if (!exists) {

        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            role_id: roles.SUPER_ADMIN.id,
            permission_id: permission.id
          })
        );
      }
    }

    /*
    =====================
    DEFAULT ADMIN USER
    =====================
    */

    const existingAdmin =
      await userRepo.findOne({
        where: {
          email: "admin@university.edu"
        }
      });

    if (!existingAdmin) {

      const admin =
        userRepo.create({
          first_name: "Super",
          last_name: "Admin",
          email: "admin@university.edu",
          password:
            await bcrypt.hash(
              "Admin123!",
              10
            ),
          role: roles.SUPER_ADMIN,
          is_active: true
        });

      await userRepo.save(admin);
    }

    console.log("Seed completed successfully");

  } catch (error) {

    console.error(error);

  } finally {

    await AppDataSource.destroy();

    process.exit(0);
  }
}

seed();