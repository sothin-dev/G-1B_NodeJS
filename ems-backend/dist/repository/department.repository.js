"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const department_entity_1 = require("../entities/department.entity");
const database_1 = require("../config/database");
class DepartmentRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(department_entity_1.Department);
    }
    async findById(id) {
        return await this.repo.findOne({ where: { id } });
    }
    async findByCode(code) {
        return await this.repo.findOne({ where: { code } });
    }
    async findAll() {
        return await this.repo.find({ order: { name: 'ASC' } });
    }
    async create(data) {
        const department = this.repo.create(data);
        return this.repo.save(department);
    }
    async update(id, data) {
        const department = await this.findById(id);
        if (!department)
            return null;
        Object.assign(department, data);
        return this.repo.save(department);
    }
    async delete(id) {
        const department = await this.findById(id);
        if (!department)
            return false;
        await this.repo.remove(department);
        return true;
    }
}
exports.DepartmentRepository = DepartmentRepository;
