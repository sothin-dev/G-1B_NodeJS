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
  /**
   * Get all students
   */
  async getAllStudents() {
    return AppDataSource.getRepository(Student).find({
      relations: ["user", "department"],
    });
  }

  /**
   * Create student
   */
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
      student_number: data.student_number,
      user: { id: user.id },
      department: { id: department.id },
      status: StudentStatus.ACTIVE,
      enrollment_year: new Date().getFullYear(),
    });
  }

  /**
   * Show detail student information
   */
  async showStudent(studentId: string) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("This student is not found", 404);
    }

    return student;
  }

  /**
   * Get student enrollment history
   */
  async getStudentEnrollmentHistory(studentId: string) {
    const student = await studentRepository.findById(studentId);

    if (!student) {
      throw new AppError("This student is not found", 404);
    }

    return enrollmentRepository.getEnrollmentHistory(studentId);
  }

  /**
   * Get all grades for a student across semesters
   */
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