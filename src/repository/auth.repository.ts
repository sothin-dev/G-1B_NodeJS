import { AppDataSource } from "../config/database";

import { User } from "../entities/user.entity";

import { BaseRepository } from "./base.repository";

class AuthRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: {
        email,
      },
      relations: {
        role: true,
      },
    });
  }

  async findByIdWithRole(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
        student: {
          department: true,
        },
        teacher: {
          department: true,
        },
      },
    });
  }

  async updateRefreshToken(id: string, token: string) {
    return this.repo.update(
      { id },
      { refreshToken: token },
    );
  }
}

export default new AuthRepository();
