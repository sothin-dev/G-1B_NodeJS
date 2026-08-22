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
      { isActive: false }
    );
  }

  async Reactivate(userId: string) {
    return await this.repo.update(
      { id: userId },
      { isActive: true }
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

  async searchUsers(params: { search?: string; role?: string; is_active?: string | boolean; page?: number; limit?: number } = {}) {
    const qb = this.repo
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .leftJoinAndSelect("user.student", "student")
      .leftJoinAndSelect("user.teacher", "teacher")
      .orderBy("user.created_at", "DESC");

    if (params.search) {
      qb.andWhere(
        "(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)",
        { search: `%${params.search}%` }
      );
    }

    if (params.role) {
      qb.andWhere("(role.name = :role OR role.id = :role)", { role: params.role });
    }

    if (params.is_active !== undefined && params.is_active !== '') {
      const active = params.is_active === 'true' || params.is_active === true;
      qb.andWhere("user.isActive = :active", { active });
    }

    if (params.page && params.limit) {
      const page = Math.max(1, Number(params.page));
      const limit = Math.max(1, Number(params.limit));
      qb.skip((page - 1) * limit).take(limit);

      const [items, totalItems] = await qb.getManyAndCount();
      return {
        items,
        meta: {
          totalItems,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const items = await qb.getMany();
    return items;
  }
}

export default new UserRepository();
