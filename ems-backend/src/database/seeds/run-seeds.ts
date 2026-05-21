import { AppDataSource } from "../../config/database";
import { User } from "../../entities/user.entity";
import * as bcrypt from "bcryptjs";

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  
  const admin = userRepo.create({
    email: "admin@university.edu",
    password: await bcrypt.hash("Admin123!", 10),
    role: "SUPER_ADMIN",
    is_active: true,
  });
  await userRepo.save(admin);
  console.log("Admin user created");
  process.exit(0);
}
seed();