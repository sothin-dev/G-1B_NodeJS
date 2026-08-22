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
  async GetAllUser(params: { search?: string; role?: string; is_active?: string | boolean; page?: number; limit?: number } = {}) {
    return await UserRepository.searchUsers(params);
  }

  async createUser(data: CreateUserDto) {
    const existingUser = await UserRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password || "Password123!");

    const firstName = data.firstName || data.email.split("@")[0];
    const lastName = data.lastName || "";

    const user = await UserRepository.create({
      firstName,
      lastName,
      password: hashedPassword,
      email: data.email,
      isActive: data.isActive !== undefined ? data.isActive : true,
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
        userId: user.id,
        departmentId: data.departmentId,
        studentNumber: data.studentNumber || `STU-${Date.now().toString().slice(-6)}`,
        status: StudentStatus.ACTIVE,
        enrollmentYear: new Date().getFullYear(),
      });
    }

    return await UserRepository.findById(user.id);
  }

  async UpdateUser(ID: string, data: UpdateUserDto) {
    const user = await UserRepository.findById(ID);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const payload: any = {};
    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.email !== undefined) payload.email = data.email;
    if (data.isActive !== undefined) payload.isActive = data.isActive;
    if (data.roleId !== undefined) payload.roleId = data.roleId;

    if (data.password) {
      payload.password = await hashPassword(data.password);
    }

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

export default new UserService;
