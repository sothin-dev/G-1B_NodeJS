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

  async updateRefreshToken(id: number, token: string) {
    return this.repo.update(
      { id },
      { refresh_token: token }, // MUST match DB column
    );
  }
}

export default new AuthRepository();
