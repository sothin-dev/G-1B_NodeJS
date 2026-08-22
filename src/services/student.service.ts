import "dotenv/config";
import { CreateStudentDto } from "../dto/createStudent.dto";

import studentRepository from "../repository/student.repository";
import enrollmentRepository from "../repository/enrollment.repository";

import { AppError } from "../core/errors/app-error";

import { AppDataSource } from "../config/database";
import { Department } from "../entities/department.entity";
import { Student, StudentStatus } from "../entities/student.entity";
import { User } from "../entities/user.entity";
import { Grade } from "../entities/grade.entity";

class StudentService {
  async getAllStudents(params: { search?: string; departmentId?: string; status?: string; page?: number; limit?: number } = {}) {
    const qb = AppDataSource.getRepository(Student)
      .createQueryBuilder("student")
      .leftJoinAndSelect("student.user", "user")
      .leftJoinAndSelect("student.department", "department")
      .orderBy("student.created_at", "DESC");

    if (params.search) {
      qb.andWhere(
        "(student.studentNumber LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)",
        { search: `%${params.search}%` }
      );
    }

    if (params.departmentId) {
      qb.andWhere("student.departmentId = :departmentId", { departmentId: params.departmentId });
    }

    if (params.status) {
      qb.andWhere("student.status = :status", { status: params.status });
    }

    if (params.page && params.limit) {
      const page = Math.max(1, Number(params.page));
      const limit = Math.max(1, Number(params.limit));
      qb.skip((page - 1) * limit).take(limit);

      const [items, totalItems] = await qb.getManyAndCount();
      return {
        items,
        meta: {
          totalItems,
          currentPage: page,
          itemsPerPage: limit,
        },
      };
    }

    const items = await qb.getMany();
    return items;
  }

  async createStudent(data: CreateStudentDto) {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: data.user_id },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const department = await AppDataSource.getRepository(Department).findOne({
      where: { id: data.department_id },
    });

    if (!department) {
      throw new AppError("Department not found", 404);
    }

    const existingStudent = await studentRepository.findByUserId(data.user_id);

    if (existingStudent) {
      throw new AppError("Student already exists for this user", 409);
    }

    return studentRepository.create({
      studentNumber: data.student_number,
      user: { id: user.id },
      department: { id: department.id },
      status: StudentStatus.ACTIVE,
      enrollmentYear: new Date().getFullYear(),
    });
  }

  async showStudent(studentId: string) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("This student is not found", 404);
    }

    return student;
  }

  async getStudentEnrollmentHistory(studentId: string) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("This student is not found", 404);
    }

    return enrollmentRepository.getEnrollmentHistory(studentId);
  }

  async getStudentGrades(studentId: string) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("This student is not found", 404);
    }

    return AppDataSource.getRepository(Grade).find({
      where: {
        student: {
          id: studentId,
        },
      },
      relations: ["course"],
      order: {
        created_at: "DESC",
      },
    });
  }
}

export default new StudentService();
