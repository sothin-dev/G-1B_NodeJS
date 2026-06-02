import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { User } from "../entities/user.entity";

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(AppDataSource.getRepository(User));
  }

  async Deactivate(userId: string) {
    return await this.repo.update(
      { id: userId },
      { is_active: false }
    );
  }

  async Reactivate(userId: string) {
    return await this.repo.update(
      { id: userId },
      { is_active: true }
    );
  }

  async ResetPassword(
    userId: string,
    hashedPassword: string
  ) {
    return await this.repo.update(
      { id: userId },
      { password: hashedPassword }
    );
  }
}

export default new UserRepository();