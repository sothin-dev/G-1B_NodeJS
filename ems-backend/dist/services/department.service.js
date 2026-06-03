"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const department_repository_1 = require("../repository/department.repository");
class DepartmentService {
    constructor() {
        this.departmentRepo = new department_repository_1.DepartmentRepository();
    }
    async listDepartments() {
        return await this.departmentRepo.findAll();
    }
    async getDepartmentById(id) {
        const department = await this.departmentRepo.findById(id);
        if (!department)
            throw new Error('Department not found');
        return department;
    }
    async createDepartment(data) {
        const existingDepartment = await this.departmentRepo.findByCode(data.code ?? '');
        if (existingDepartment) {
            throw new Error('Department code already exists');
        }
        return await this.departmentRepo.create(data);
    }
    async updateDepartment(id, data) {
        if (data.code) {
            const existingDepartment = await this.departmentRepo.findByCode(data.code);
            if (existingDepartment && existingDepartment.id !== id) {
                throw new Error('Department code already exists');
            }
        }
        const department = await this.departmentRepo.update(id, data);
        if (!department)
            throw new Error('Department not found');
        return department;
    }
    async deleteDepartment(id) {
        const deleted = await this.departmentRepo.delete(id);
        if (!deleted)
            throw new Error('Department not found');
    }
}
exports.DepartmentService = DepartmentService;
