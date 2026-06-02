"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const database_1 = require("../config/database");
const department_entity_1 = require("../entities/department.entity");
exports.DepartmentRepository = database_1.AppDataSource.getRepository(department_entity_1.Department).extend({
    async findAllWithCounts(search) {
        const qb = this.createQueryBuilder("d")
            .loadRelationCountAndMap("d.courseCount", "d.courses")
            .loadRelationCountAndMap("d.teacherCount", "d.teachers")
            .orderBy("d.name", "ASC");
        if (search) {
            qb.where("d.name LIKE :s OR d.code LIKE :s", { s: `%${search}%` });
        }
        return qb.getMany();
    },
    async findByIdWithRelations(id) {
        return this.findOne({
            where: { id },
            relations: ["courses", "courses.teacher", "teachers", "teachers.user"],
        });
    },
    async findByNameOrCode(name, code) {
        return this.findOne({
            where: [{ name }, { code }],
        });
    },
    async findByCode(code) {
        return this.findOneBy({ code });
    },
});
