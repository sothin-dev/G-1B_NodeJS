import { AppDataSource } from '../config/database';
import { Grade } from '../entities/grade.entity';
import { Course } from '../entities/course.entity';
import { Student } from '../entities/student.entity';
import { AppError } from '../core/errors/app-error';

export class GradeService {
  private gradeRepo = AppDataSource.getRepository(Grade);
  private courseRepo = AppDataSource.getRepository(Course);
  private studentRepo = AppDataSource.getRepository(Student);

  async listGrades(filters: { courseId?: string; studentId?: string } = {}) {
    const query = this.gradeRepo.createQueryBuilder('grade')
      .leftJoinAndSelect('grade.course', 'course')
      .leftJoinAndSelect('grade.student', 'student')
      .leftJoinAndSelect('student.user', 'user')
      .orderBy('grade.created_at', 'DESC');

    if (filters.courseId) {
      query.andWhere('grade.courseId = :courseId', { courseId: filters.courseId });
    }

    if (filters.studentId) {
      query.andWhere('grade.studentId = :studentId', { studentId: filters.studentId });
    }

    return query.getMany();
  }

  async getGrade(gradeId: string) {
    const grade = await this.gradeRepo.findOne({
      where: { id: gradeId },
      relations: ['course', 'student', 'student.user'],
    });

    if (!grade) throw new AppError('Grade not found', 404);
    return grade;
  }

  async createGrade(data: { studentId: string; courseId: string; assignment_score?: number; midterm_score?: number; final_score?: number }) {
    const student = await this.studentRepo.findOne({ where: { id: data.studentId } });
    if (!student) throw new AppError('Student not found', 404);

    const course = await this.courseRepo.findOne({ where: { id: data.courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const existing = await this.gradeRepo.findOne({
      where: { student: { id: data.studentId }, course: { id: data.courseId } },
    });

    if (existing) throw new AppError('Grade record already exists for this student and course', 409);

    const grade = this.gradeRepo.create({
      student: { id: data.studentId },
      course: { id: data.courseId },
      assignment_score: data.assignment_score ?? 0,
      midterm_score: data.midterm_score ?? 0,
      final_score: data.final_score ?? 0,
    });

    return this.saveGradeRecord(grade);
  }

  async updateGrade(gradeId: string, data: { assignment_score?: number; midterm_score?: number; final_score?: number }) {
    const grade = await this.getGrade(gradeId);

    if (data.assignment_score !== undefined) grade.assignment_score = data.assignment_score;
    if (data.midterm_score !== undefined) grade.midterm_score = data.midterm_score;
    if (data.final_score !== undefined) grade.final_score = data.final_score;

    return this.saveGradeRecord(grade);
  }

  async deleteGrade(gradeId: string) {
    const grade = await this.getGrade(gradeId);
    await this.gradeRepo.remove(grade);
    return { message: 'Grade deleted successfully' };
  }

  async publishGrade(gradeId: string) {
    const grade = await this.getGrade(gradeId);
    grade.grade = this.calculateLetterGrade(grade.total_score ?? this.calculateTotal(grade));
    return this.gradeRepo.save(grade);
  }

  async bulkUpload(courseId: string, records: Array<{ studentId: string; assignment_score?: number; midterm_score?: number; final_score?: number }>) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const results = [] as Grade[];

    for (const record of records) {
      const existing = await this.gradeRepo.findOne({
        where: { student: { id: record.studentId }, course: { id: courseId } },
      });

      if (existing) {
        existing.assignment_score = record.assignment_score ?? existing.assignment_score ?? 0;
        existing.midterm_score = record.midterm_score ?? existing.midterm_score ?? 0;
        existing.final_score = record.final_score ?? existing.final_score ?? 0;
        results.push(await this.saveGradeRecord(existing));
      } else {
        const created = this.gradeRepo.create({
          student: { id: record.studentId },
          course: { id: courseId },
          assignment_score: record.assignment_score ?? 0,
          midterm_score: record.midterm_score ?? 0,
          final_score: record.final_score ?? 0,
        });
        results.push(await this.saveGradeRecord(created));
      }
    }

    return results;
  }

  async getGradesByCourse(courseId: string) {
    return this.gradeRepo.find({
      where: { course: { id: courseId } },
      relations: ['student', 'student.user', 'course'],
      order: { created_at: 'DESC' },
    });
  }

  private async saveGradeRecord(grade: Grade) {
    const total = this.calculateTotal(grade);
    grade.total_score = total;
    grade.grade = this.calculateLetterGrade(total);
    return this.gradeRepo.save(grade);
  }

  private calculateTotal(grade: Grade) {
    return (grade.assignment_score ?? 0) + (grade.midterm_score ?? 0) + (grade.final_score ?? 0);
  }

  private calculateLetterGrade(total: number) {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  }
}

export default new GradeService();
