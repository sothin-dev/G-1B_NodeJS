import "dotenv/config";
import { hashPassword } from "../utils/hash-password";
import { AppError } from "../core/errors/app-error";

import UserRepository from "../repository/user.repository";

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