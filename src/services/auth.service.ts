import authRepository from "../repository/auth.repository";
import roleRepository from "../repository/role.repository";
import "dotenv/config";

import { hashPassword, comparePassword } from "../utils/hash-password";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generate-token";

import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";

import { Roles } from "../constants/roles";

import { AppError } from "../core/errors/app-error";
import { Student, StudentStatus } from "../entities/student.entity";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";

class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const role = await roleRepository.findByName(Roles.STUDENT);

    if (!role) {
      throw new AppError("Student role not configured", 500);
    }

    const hashedPassword = await hashPassword(data.password);

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.save(User, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        roleId: role.id,
      });

      await queryRunner.manager.save(Student, {
        user: { id: user.id },
        status: StudentStatus.ACTIVE,
        enrollmentYear: new Date().getFullYear(),
      });

      await queryRunner.commitTransaction();

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: role.name,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async login(data: LoginDto) {
    const user = await authRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated. Contact an administrator.", 403);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = generateAccessToken(payload);

    const refreshToken = generateRefreshToken(payload);

    await authRepository.updateRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await authRepository.findByIdWithRole(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Extract flat list of permissions from role
    const permissions =
      user.role?.rolePermissions?.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        module: rp.permission.module,
      })) || [];

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || null,
      isActive: user.isActive,
      student: user.student ? {
        id: user.student.id,
        studentNumber: user.student.studentNumber,
        department: user.student.department?.name,
        departmentId: user.student.departmentId,
        status: user.student.status,
      } : null,
      teacher: user.teacher ? {
        id: user.teacher.id,
        department: user.teacher.department?.name,
        departmentId: user.teacher.departmentId,
      } : null,
      permissions,
    };
  }

  async logout(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.refreshToken || user.refreshToken.trim() === "") {
      return "User is already logged out";
    }

    await authRepository.updateRefreshToken(userId, "");

    return "logout Successful";
  }
}

export default new AuthService();
