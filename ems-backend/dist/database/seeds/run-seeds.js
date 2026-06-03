"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
const role_permission_entity_1 = require("../../entities/role_permission.entity");
const bcrypt = __importStar(require("bcryptjs"));
async function seed() {
    await database_1.AppDataSource.initialize();
    const roleRepo = database_1.AppDataSource.getRepository(role_entity_1.Role);
    const permissionRepo = database_1.AppDataSource.getRepository(permission_entity_1.Permission);
    const userRepo = database_1.AppDataSource.getRepository(user_entity_1.User);
    const rolePermissionRepo = database_1.AppDataSource.getRepository(role_permission_entity_1.RolePermission);
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
        const roles = {};
        for (const name of roleNames) {
            let role = await roleRepo.findOne({
                where: { name }
            });
            if (!role) {
                role =
                    await roleRepo.save(roleRepo.create({ name }));
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
        const savedPermissions = [];
        for (const permission of permissions) {
            let existing = await permissionRepo.findOne({
                where: {
                    name: permission.name
                }
            });
            if (!existing) {
                existing =
                    await permissionRepo.save(permissionRepo.create(permission));
            }
            savedPermissions.push(existing);
        }
        /*
        =====================
        SUPER ADMIN GETS ALL
        =====================
        */
        for (const permission of savedPermissions) {
            const exists = await rolePermissionRepo.findOne({
                where: {
                    role_id: roles.SUPER_ADMIN.id,
                    permission_id: permission.id
                }
            });
            if (!exists) {
                await rolePermissionRepo.save(rolePermissionRepo.create({
                    role_id: roles.SUPER_ADMIN.id,
                    permission_id: permission.id
                }));
            }
        }
        /*
        =====================
        DEFAULT ADMIN USER
        =====================
        */
        const existingAdmin = await userRepo.findOne({
            where: {
                email: "admin@university.edu"
            }
        });
        if (!existingAdmin) {
            const admin = userRepo.create({
                first_name: "Super",
                last_name: "Admin",
                email: "admin@university.edu",
                password: await bcrypt.hash("Admin123!", 10),
                role: roles.SUPER_ADMIN,
                is_active: true
            });
            await userRepo.save(admin);
        }
        console.log("Seed completed successfully");
    }
    catch (error) {
        console.error(error);
    }
    finally {
        await database_1.AppDataSource.destroy();
        process.exit(0);
    }
}
seed();
