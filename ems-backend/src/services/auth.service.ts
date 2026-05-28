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
import studentRepository from "../repository/student.repository";
import { StudentStatus } from "../entities/student.entity";

class AuthService {
  async register(data: RegisterDto) {
    const existingUser = await authRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);

    // DEFAULT ROLE = STUDENT
    let role = await roleRepository.findByName(Roles.STUDENT);

    if (!role) {
      role = await roleRepository.create({
        name: Roles.STUDENT,
      });
    }

    const user = await authRepository.create({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password: hashedPassword,
      roleId: role.id,
    });

    try {
      await studentRepository.create({
        user: { id: user.id } as any,
        status: StudentStatus.ACTIVE,
        enrollment_year: new Date().getFullYear(),
      });
    } catch (err) {
      console.error("STUDENT CREATE ERROR:", err);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: role.name,
    };

    // const accessToken = generateAccessToken(payload);

    return {
      firstName: user.first_name,
      lastName: user.last_name,
      id: user.id,
      email: user.email,
      role: role.name,
      // Token: accessToken,
    };
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

  async logout(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.refresh_token || user.refresh_token.trim() === "") {
      return "User is already logged out";
    }

    await authRepository.updateRefreshToken(userId, "");

    return "logout Successful";
  }
}

export default new AuthService();
