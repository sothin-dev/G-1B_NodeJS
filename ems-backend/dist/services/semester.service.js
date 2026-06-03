"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemesterService = void 0;
const semester_repository_1 = require("../repository/semester.repository");
const semester_entity_1 = require("../entities/semester.entity");
class SemesterService {
    constructor() {
        this.semesterRepo = new semester_repository_1.SemesterRepository();
    }
    async listSemesters() {
        return await this.semesterRepo.findAll();
    }
    async getSemesterById(id) {
        const semester = await this.semesterRepo.findById(id);
        if (!semester)
            throw new Error('Semester not found');
        return semester;
    }
    async createSemester(data) {
        if (data.status && !Object.values(semester_entity_1.SemesterStatus).includes(data.status)) {
            throw new Error('Invalid semester status');
        }
        return await this.semesterRepo.create(data);
    }
    async updateSemester(id, data) {
        if (data.status && !Object.values(semester_entity_1.SemesterStatus).includes(data.status)) {
            throw new Error('Invalid semester status');
        }
        const semester = await this.semesterRepo.update(id, data);
        if (!semester)
            throw new Error('Semester not found');
        return semester;
    }
    async deleteSemester(id) {
        const deleted = await this.semesterRepo.delete(id);
        if (!deleted)
            throw new Error('Semester not found');
    }
}
exports.SemesterService = SemesterService;
