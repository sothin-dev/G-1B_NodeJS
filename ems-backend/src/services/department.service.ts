import { DepartmentRepository } from "../repository/department.repository";
import { CreateDepartmentDto }  from "../dto/create-department.dto";
import { UpdateDepartmentDto }  from "../dto/update-department.dto";
import { AppError }             from "../core/errors/app-error";

export class DepartmentService {

  async getAll(search?: string) {
    return await DepartmentRepository.findAllWithCounts(search);
  }

  async getOne(id: string) {
    const dept = await DepartmentRepository.findByIdWithRelations(id);
    if (!dept) throw new AppError("Department not found", 404);
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const name = dto.name.trim();
    const code = dto.code.trim().toUpperCase();

    const exists = await DepartmentRepository.findByNameOrCode(name, code);
    if (exists) throw new AppError("Department name or code already exists", 409);

    const dept = DepartmentRepository.create({
      name,
      code,
      description: dto.description,
    });
    return await DepartmentRepository.save(dept);
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await DepartmentRepository.findOneBy({ id });
    if (!dept) throw new AppError("Department not found", 404);

    const nextName = dto.name?.trim() ?? dept.name;
    const nextCode = dto.code?.trim().toUpperCase() ?? dept.code;

    if (nextName !== dept.name || nextCode !== dept.code) {
      const taken = await DepartmentRepository.findByNameOrCodeExcludingId(nextName, nextCode, id);
      if (taken) throw new AppError("Department name or code already in use", 409);
    }

    if (dto.name)        dept.name        = nextName;
    if (dto.code)        dept.code        = nextCode;
    if (dto.description !== undefined) dept.description = dto.description;

    return await DepartmentRepository.save(dept);
  }

  async delete(id: string) {
    const dept = await DepartmentRepository.findByIdWithRelations(id);
    if (!dept) throw new AppError("Department not found", 404);

    if (dept.courses?.length  > 0)
      throw new AppError("Cannot delete: department has active courses", 409);
    if (dept.teachers?.length > 0)
      throw new AppError("Cannot delete: department has assigned teachers", 409);

    await DepartmentRepository.remove(dept);
    return { message: "Department deleted successfully" };
  }

  async getCourses(id: string) {
    const dept = await DepartmentRepository.findByIdWithRelations(id);
    if (!dept) throw new AppError("Department not found", 404);
    return dept.courses ?? [];
  }

  async getTeachers(id: string) {
    const dept = await DepartmentRepository.findByIdWithRelations(id);
    if (!dept) throw new AppError("Department not found", 404);
    return dept.teachers ?? [];
  }
}
