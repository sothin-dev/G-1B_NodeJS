import "dotenv/config";

import { AppDataSource } from "../config/database";
import { AppError } from "../core/errors/app-error";
import { CreateTeacherDto } from "../dto/createTeacher.dto";
import { UpdateTeacherDto } from "../dto/updateTeacher.dto";
import { Department } from "../entities/department.entity";
import { Role } from "../entities/role.entity";
import { Teacher } from "../entities/teacher.entity";
import { User } from "../entities/user.entity";
import courseRepository from "../repository/course.repository";
import teacherRepository from "../repository/teacher.repository";

class TeacherService {
  async getAllTeachers(departmentId?: string) {
    if (departmentId) {
      const department = await AppDataSource.getRepository(Department).findOne({
        where: { id: departmentId },
      });

      if (!department) {
        throw new AppError("Department not found", 404);
      }

      return AppDataSource.getRepository(Teacher).find({
        where: { department: { id: departmentId } as any },
        relations: ["user", "department"],
        order: { created_at: "DESC" },
      });
    }

    return AppDataSource.getRepository(Teacher).find({
      relations: ["user", "department"],
      order: { created_at: "DESC" },
    });
  }

  async createTeacher(data: CreateTeacherDto) {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: data.user_id },
      relations: ["role"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingTeacher = await teacherRepository.findByUserId(data.user_id);

    if (existingTeacher) {
      throw new AppError("Teacher already exists for this user", 409);
    }

    if (data.department_id) {
      const department = await AppDataSource.getRepository(Department).findOne({
        where: { id: data.department_id },
      });

      if (!department) {
        throw new AppError("Department not found", 404);
      }
    }

    const teacherRole = await AppDataSource.getRepository(Role).findOne({
      where: { name: "TEACHER" },
    });

    if (teacherRole && user.roleId !== teacherRole.id) {
      await AppDataSource.getRepository(User).update(user.id, {
        roleId: teacherRole.id,
      });
    }

    return teacherRepository.create({
      user: { id: user.id },
      department: data.department_id ? { id: data.department_id } : undefined,
    });
  }

  async showTeacher(id: string) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
    }

    return teacher;
  }

  async updateTeacher(id: string, data: UpdateTeacherDto) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
    }

    if (data.department_id) {
      const department = await AppDataSource.getRepository(Department).findOne({
        where: { id: data.department_id },
      });

      if (!department) {
        throw new AppError("Department not found", 404);
      }
    }

    return teacherRepository.update(id, {
      departmentId: data.department_id ?? teacher.departmentId,
    } as any);
  }

  async deleteTeacher(id: string) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
    }

    await teacherRepository.delete(id);

    return { message: "Teacher deleted successfully" };
  }

  async listTeacherCourses(id: string) {
    const teacher = await teacherRepository.findById(id);

    if (!teacher) {
      throw new AppError("Teacher not found", 404);
    }

    return courseRepository.listCourses({ teacherId: id });
  }
}

export default new TeacherService();
