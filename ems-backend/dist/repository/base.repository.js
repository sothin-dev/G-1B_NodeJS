"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async findById(id) {
        return this.repo.findOneBy({
            id
        });
    }
    async create(data) {
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }
}
exports.BaseRepository = BaseRepository;
