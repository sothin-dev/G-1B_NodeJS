import { Repository, DeepPartial } from "typeorm";

export abstract class BaseRepository<T> {
  constructor(protected repo: Repository<T>) {}

  async findById(id: number): Promise<T | null> {
    return this.repo.findOneBy({ id } as any);
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repo.create(data);
    return this.repo.save(entity);
  }
}