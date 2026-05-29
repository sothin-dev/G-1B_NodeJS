import {
  Repository,
  ObjectLiteral,
  DeepPartial,
  FindOptionsWhere,
} from "typeorm";

import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseRepository<T extends ObjectLiteral, ID = string> {
  constructor(protected readonly repo: Repository<T>) {}

  async findAll() {
    return await this.repo.find();
  }

  async create(data: DeepPartial<T>) {
    const entity = this.repo.create(data);

    return await this.repo.save(entity);
  }

  async findById(id: ID) {
    return await this.repo.findOne({
      where: {
        id,
      } as FindOptionsWhere<T>,
    });
  }

  async update(id: ID, data: QueryDeepPartialEntity<T>) {
    await this.repo.update(id as any, data);

    return this.findById(id);
  }

  async delete(id: ID) {
    return await this.repo.delete(id as any);
  }

  async findByEmail(email: string) {
    return this.repo.findOne({
      where: {
        email,
      } as any,
    });
  }
}
