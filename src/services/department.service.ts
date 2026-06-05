import "dotenv/config";
import { CreateDepartmentDto } from "../dto/createDepartment.dto";
import { UpdateDepartmentDto } from "../dto/updateDepartment.dto";

import departmentRepository from "../repository/department.repository";

import { AppError } from "../core/errors/app-error";
import { AppDataSource } from "../config/database";
import { Department } from "../entities/department.entity";
import { Course } from "../entities/course.entity";
import { Teacher } from "../entities/teacher.entity";

class DepartmentService {
  async getAllDepartments() {
    return AppDataSource.getRepository(Department).find();
  }

  async createDepartment(data: CreateDepartmentDto) {
    const existing = await departmentRepository.findByCode(data.code);

    if (existing) {
      throw new AppError("Department code already exists", 409);
    }

    return departmentRepository.create({
      name: data.name,
      code: data.code,
    });
  }

  async getDepartment(id: string) {
    const dept = await departmentRepository.findByIdWithRelations(id);

    if (!dept) {
      throw new AppError("Department not found", 404);
    }

    return dept;
  }

  async updateDepartment(id: string, data: UpdateDepartmentDto) {
    const dept = await departmentRepository.findById(id);

    if (!dept) {
      throw new AppError("Department not found", 404);
    }

    if (data.code) {
      const existing = await departmentRepository.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new AppError("Department code already exists", 409);
      }
    }

    return departmentRepository.update(id, data as any);
  }

  async deleteDepartment(id: string) {
    const dept = await departmentRepository.findById(id);

    if (!dept) {
      throw new AppError("Department not found", 404);
    }

    const courseCount = await AppDataSource.getRepository(Course).count({
      where: { department: { id } as any },
    });

    const teacherCount = await AppDataSource.getRepository(Teacher).count({
      where: { department: { id } as any },
    });

    if (courseCount > 0 || teacherCount > 0) {
      throw new AppError(
        "Cannot delete department with active courses or teachers",
        400,
      );
    }

    await departmentRepository.delete(id);

    return { message: "Department deleted successfully" };
  }

  async listCourses(id: string) {
    const dept = await departmentRepository.findById(id);

    if (!dept) {
      throw new AppError("Department not found", 404);
    }

    return AppDataSource.getRepository(Course).find({
      where: { department: { id } as any },
    });
  }

  async listTeachers(id: string) {
    const dept = await departmentRepository.findById(id);

    if (!dept) {
      throw new AppError("Department not found", 404);
    }

    return AppDataSource.getRepository(Teacher).find({
      where: { department: { id } as any },
      relations: ["user"],
    });
  }
}

export default new DepartmentService();
