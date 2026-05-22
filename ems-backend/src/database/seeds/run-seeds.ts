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

  // Create roles
  const superAdminRole = roleRepo.create({
    name: "SUPER_ADMIN"
  });

  const studentRole = roleRepo.create({
    name: "STUDENT"
  });

  const teacherRole = roleRepo.create({
    name: "TEACHER"
  });

  await roleRepo.save([
    superAdminRole,
    studentRole,
    teacherRole
  ]);

  // Create admin user
  const admin = userRepo.create({
    email: "admin@university.edu",
    password: await bcrypt.hash(
      "Admin123!",
      10
    ),
    role: superAdminRole,
    is_active: true
  });

  await userRepo.save(admin);

  console.log("Seed completed");
  process.exit(0);
}

seed();