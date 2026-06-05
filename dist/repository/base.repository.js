"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async findAll() {
        return await this.repo.find();
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
    async findByEmail(email) {
        return this.repo.findOne({
            where: {
                email,
            },
        });
    }
    async findOne(where) {
        return this.repo.findOne({
            where,
        });
    }
    async findMany(where) {
        return this.repo.find({
            where,
        });
    }
}
exports.BaseRepository = BaseRepository;
