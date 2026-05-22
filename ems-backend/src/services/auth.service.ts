import authRepository from "../repository/auth.repository";

import {
  hashPassword,
  comparePassword
} from "../utils/hash-password";

import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generate-token";

import { RegisterDto }
from "../dto/register.dto";

import { LoginDto }
from "../dto/login.dto";

import { Roles }
from "../constants/roles";
import roleRepository from "../repository/role.repository";

class AuthService {

  async register(data: RegisterDto) {

  const existingUser =
    await authRepository.findByEmail(
      data.email
    );

  if (existingUser) {
    throw new Error(
      "Email already exists"
    );
  }

  const hashedPassword =
    await hashPassword(
      data.password
    );

  const studentRole =
    await roleRepository.findByName(
      Roles.STUDENT
    );

  if (!studentRole) {
    throw new Error(
      "Student role not found"
    );
  }

  const user =
    await authRepository.create({
      email: data.email,
      password: hashedPassword,
      role: studentRole
    });

  return {
    id: user.id,
    email: user.email,
    role: user.role.name
  };
}

  async login(data: LoginDto) {

    const user =
      await authRepository.findByEmail(
        data.email
      );

    if (!user) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const isMatch =
      await comparePassword(
        data.password,
        user.password
      );

    if (!isMatch) {
      throw new Error(
        "Invalid credentials"
      );
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken =
      generateAccessToken(payload);

    const refreshToken =
      generateRefreshToken(payload);

    await authRepository.updateRefreshToken(
      user.id,
      refreshToken
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  async logout(userId: number) {

    const user =
      await authRepository.findById(
        userId
      );

    if (!user) {
      throw new Error(
        "User not found"
      );
    }

    await authRepository.updateRefreshToken(
      userId,
      ""
    );

    return true;
  }
}

export default new AuthService();