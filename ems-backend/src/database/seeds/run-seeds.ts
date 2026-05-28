import { AppDataSource } from "../../config/database";
import { User } from "../../entities/user.entity";
import { Role } from "../../entities/role.entity";
import * as bcrypt from "bcryptjs";

async function seed() {
  await AppDataSource.initialize();

  const roleRepo =
    AppDataSource.getRepository(Role);

  const userRepo =
    AppDataSource.getRepository(User);

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

  const superAdminRole =
    existingRoles.find((role) => role.name === "SUPER_ADMIN") ||
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