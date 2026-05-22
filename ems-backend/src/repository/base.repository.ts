import {
  Repository,
  DeepPartial,
  ObjectLiteral
} from "typeorm";

export abstract class BaseRepository<
  T extends ObjectLiteral
> {

  constructor(
    protected repo: Repository<T>
  ) {}

  async findById(id: number) {

    return this.repo.findOneBy({
      id
    } as any);

  }

  async create(
    data: DeepPartial<T>
  ) {

    const entity =
      this.repo.create(data);

    return this.repo.save(entity);

  }
}