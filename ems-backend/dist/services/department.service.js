"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const department_repository_1 = require("../repository/department.repository");
const app_error_1 = require("../core/errors/app-error");
class DepartmentService {
    async getAll(search) {
        return await department_repository_1.DepartmentRepository.findAllWithCounts(search);
    }
    async getOne(id) {
        const dept = await department_repository_1.DepartmentRepository.findByIdWithRelations(id);
        if (!dept)
            throw new app_error_1.AppError("Department not found", 404);
        return dept;
    }
    async create(dto) {
        const exists = await department_repository_1.DepartmentRepository.findByNameOrCode(dto.name, dto.code);
        if (exists)
            throw new app_error_1.AppError("Department name or code already exists", 409);
        const dept = department_repository_1.DepartmentRepository.create({
            name: dto.name.trim(),
            code: dto.code.toUpperCase().trim(),
            description: dto.description,
        });
        return await department_repository_1.DepartmentRepository.save(dept);
    }
    async update(id, dto) {
        const dept = await department_repository_1.DepartmentRepository.findOneBy({ id });
        if (!dept)
            throw new app_error_1.AppError("Department not found", 404);
        if (dto.code && dto.code.toUpperCase() !== dept.code) {
            const taken = await department_repository_1.DepartmentRepository.findByCode(dto.code.toUpperCase());
            if (taken)
                throw new app_error_1.AppError("Department code already in use", 409);
        }
        if (dto.name)
            dept.name = dto.name.trim();
        if (dto.code)
            dept.code = dto.code.toUpperCase().trim();
        if (dto.description !== undefined)
            dept.description = dto.description;
        return await department_repository_1.DepartmentRepository.save(dept);
    }
    async delete(id) {
        const dept = await department_repository_1.DepartmentRepository.findByIdWithRelations(id);
        if (!dept)
            throw new app_error_1.AppError("Department not found", 404);
        if (dept.courses?.length > 0)
            throw new app_error_1.AppError("Cannot delete: department has active courses", 409);
        if (dept.teachers?.length > 0)
            throw new app_error_1.AppError("Cannot delete: department has assigned teachers", 409);
        await department_repository_1.DepartmentRepository.remove(dept);
        return { message: "Department deleted successfully" };
    }
    async getCourses(id) {
        const dept = await department_repository_1.DepartmentRepository.findByIdWithRelations(id);
        if (!dept)
            throw new app_error_1.AppError("Department not found", 404);
        return dept.courses ?? [];
    }
    async getTeachers(id) {
        const dept = await department_repository_1.DepartmentRepository.findByIdWithRelations(id);
        if (!dept)
            throw new app_error_1.AppError("Department not found", 404);
        return dept.teachers ?? [];
    }
}
exports.DepartmentService = DepartmentService;
