"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async create(data) {
        const entity = this.repo.create(data);
        return await this.repo.save(entity);
    }
    async findById(id) {
        return await this.repo.findOne({
            where: {
                id,
            },
        });
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        return await this.repo.delete(id);
    }
}
exports.BaseRepository = BaseRepository;
