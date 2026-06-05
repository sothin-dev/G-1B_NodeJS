import "dotenv/config";
import { hashPassword } from "../utils/hash-password";
import { AppError } from "../core/errors/app-error";

import UserRepository from "../repository/user.repository";
import teacherRepository from "../repository/teacher.repository";
import studentRepository from "../repository/student.repository";
import roleRepository from "../repository/role.repository";
import { StudentStatus } from "../entities/student.entity";

import { CreateUserDto } from "../dto/createUser.dto";
import { UpdateUserDto } from "../dto/updateUser.dto";

class UserService {
  async GetAllUser() {
    const data = await UserRepository.findAll();
    return data;
  }

  async createUser(data: CreateUserDto) {
  const existingUser = await UserRepository.findByEmail(data.email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await UserRepository.create({
    first_name: data.firstName,
    last_name: data.lastName,
    password: hashedPassword,
    email: data.email,
    is_active: data.isActive,
    roleId: data.roleId,
  });

  // create profile based on role
  const role = await roleRepository.findById(data.roleId);

  if (!role) {
    throw new AppError("Role not found", 404);
  }

  if (role.name === "TEACHER") {
    await teacherRepository.create({
      userId: user.id,
      departmentId: data.departmentId,
    });
  }

  if (role.name === "STUDENT") {
    await studentRepository.create({
      user: { id: user.id },
      departmentId: data.departmentId,
      student_number: data.studentNumber,
      status: StudentStatus.ACTIVE,
      enrollment_year: new Date().getFullYear(),
    });
  }

  return user;
}

  async UpdateUser(ID: string, data: UpdateUserDto) {
    const user = await UserRepository.findById(ID);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const payload = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      is_active: data.isActive,
      roleId: data.roleId,
    };

    return await UserRepository.update(ID, payload);
  }

  async deactivateUser(userId: string) {
    const result = await UserRepository.Deactivate(userId);

    if (result.affected === 0) {
      throw new AppError("User not found", 404);
    }

    return {
      message: "User deactivated successfully",
    };
  }

  async reactivateUser(userId: string) {
    const result = await UserRepository.Reactivate(userId);

    if (result.affected === 0) {
      throw new AppError("User not found", 404);
    }

    return {
      message: "User reactivated successfully",
    };
  }
}

export default new UserService