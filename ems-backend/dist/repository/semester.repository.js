"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemesterRepository = void 0;
const semester_entity_1 = require("../entities/semester.entity");
const database_1 = require("../config/database");
class SemesterRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(semester_entity_1.Semester);
    }
    async findById(id) {
        return await this.repo.findOne({ where: { id } });
    }
    async findActive() {
        return await this.repo.findOne({ where: { status: semester_entity_1.SemesterStatus.ACTIVE } });
    }
    async findAll() {
        return await this.repo.find({ order: { start_date: 'DESC' } });
    }
    async create(data) {
        const semester = this.repo.create(data);
        return this.repo.save(semester);
    }
    async update(id, data) {
        const semester = await this.findById(id);
        if (!semester)
            return null;
        Object.assign(semester, data);
        return this.repo.save(semester);
    }
    async delete(id) {
        const semester = await this.findById(id);
        if (!semester)
            return false;
        await this.repo.remove(semester);
        return true;
    }
}
exports.SemesterRepository = SemesterRepository;
