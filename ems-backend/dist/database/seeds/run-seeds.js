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
const bcrypt = __importStar(require("bcryptjs"));
async function seed() {
    await database_1.AppDataSource.initialize();
    const roleRepo = database_1.AppDataSource.getRepository(role_entity_1.Role);
    const userRepo = database_1.AppDataSource.getRepository(user_entity_1.User);
    // Ensure required roles exist
    const requiredRoleNames = [
        "SUPER_ADMIN",
        "ADMIN",
        "TEACHER",
        "STUDENT",
    ];
    const existingRoles = await roleRepo.find({
        where: requiredRoleNames.map((name) => ({ name })),
    });
    const existingRoleNames = new Set(existingRoles.map((role) => role.name));
    const missingRoles = requiredRoleNames
        .filter((name) => !existingRoleNames.has(name))
        .map((name) => roleRepo.create({ name }));
    if (missingRoles.length > 0) {
        await roleRepo.save(missingRoles);
    }
    const superAdminRole = existingRoles.find((role) => role.name === "SUPER_ADMIN") ||
        missingRoles.find((role) => role.name === "SUPER_ADMIN");
    // Create admin user if it does not already exist
    const existingAdmin = await userRepo.findOne({
        where: { email: "admin@university.edu" },
    });
    if (!existingAdmin && superAdminRole) {
        const admin = userRepo.create({
            first_name: "Admin",
            last_name: "User",
            email: "admin@university.edu",
            password: await bcrypt.hash("Admin123!", 10),
            role: superAdminRole,
            is_active: true,
        });
        await userRepo.save(admin);
    }
    console.log("Seed completed");
    process.exit(0);
}
seed();
