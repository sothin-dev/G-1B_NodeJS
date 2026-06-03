"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRepository = void 0;
const teacher_entity_1 = require("../entities/teacher.entity");
const database_1 = require("../config/database");
class TeacherRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(teacher_entity_1.Teacher);
    }
    async findById(id) {
        return await this.repo.findOne({
            where: { id },
            relations: ['user', 'department'],
        });
    }
    async findByUserId(userId) {
        return await this.repo.findOne({
            where: { userId },
            relations: ['user', 'department'],
        });
    }
    async findAll() {
        return await this.repo.find({
            relations: ['user', 'department'],
            order: { id: 'ASC' },
        });
    }
    async create(data) {
        const teacher = this.repo.create(data);
        return this.repo.save(teacher);
    }
    async update(id, data) {
        const teacher = await this.findById(id);
        if (!teacher)
            return null;
        Object.assign(teacher, data);
        return this.repo.save(teacher);
    }
    async delete(id) {
        const teacher = await this.findById(id);
        if (!teacher)
            return false;
        await this.repo.remove(teacher);
        return true;
    }
}
exports.TeacherRepository = TeacherRepository;
