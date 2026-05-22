import { AppDataSource } from "../config/database";

import { User } from "../entities/user.entity";

import { BaseRepository } from "./base.repository";

class AuthRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
    });
  }

  async updateRefreshToken(userId: number, token: string) {
    await this.repo.update(userId, {
      refresh_token: token,
    });
  }
}

export default new AuthRepository();
