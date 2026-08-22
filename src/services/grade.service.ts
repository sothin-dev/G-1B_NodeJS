import { AppDataSource } from '../config/database';
import { Grade } from '../entities/grade.entity';
import { Course } from '../entities/course.entity';
import { Student } from '../entities/student.entity';
import { EnrollmentCourse } from '../entities/enrollment-course.entity';
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

  async createGrade(data: { studentId: string; courseId: string; assignmentScore?: number; midtermScore?: number; finalScore?: number }) {
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
      assignmentScore: data.assignmentScore ?? 0,
      midtermScore: data.midtermScore ?? 0,
      finalScore: data.finalScore ?? 0,
    });

    return this.saveGradeRecord(grade);
  }

  async updateGrade(gradeId: string, data: { studentId?: string; courseId?: string; assignmentScore?: number; midtermScore?: number; finalScore?: number }) {
    if (gradeId.startsWith('pending_')) {
      const studentId = data.studentId || gradeId.replace('pending_', '');
      if (studentId && data.courseId) {
        return this.createGrade({
          studentId,
          courseId: data.courseId,
          assignmentScore: data.assignmentScore,
          midtermScore: data.midtermScore,
          finalScore: data.finalScore,
        });
      }
    }

    const grade = await this.getGrade(gradeId);

    if (data.assignmentScore !== undefined) grade.assignmentScore = data.assignmentScore;
    if (data.midtermScore !== undefined) grade.midtermScore = data.midtermScore;
    if (data.finalScore !== undefined) grade.finalScore = data.finalScore;

    return this.saveGradeRecord(grade);
  }

  async deleteGrade(gradeId: string) {
    const grade = await this.getGrade(gradeId);
    await this.gradeRepo.remove(grade);
    return { message: 'Grade deleted successfully' };
  }

  async publishGrade(gradeId: string) {
    const grade = await this.getGrade(gradeId);
    grade.letterGrade = this.calculateLetterGrade(grade.totalScore ?? this.calculateTotal(grade));
    grade.isPublished = true;
    return this.gradeRepo.save(grade);
  }

  async bulkUpload(courseId: string, records: Array<{ studentId: string; assignmentScore?: number; midtermScore?: number; finalScore?: number }>) {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new AppError('Course not found', 404);

    const results = [] as Grade[];

    for (const record of records) {
      const existing = await this.gradeRepo.findOne({
        where: { student: { id: record.studentId }, course: { id: courseId } },
      });

      if (existing) {
        existing.assignmentScore = record.assignmentScore ?? existing.assignmentScore ?? 0;
        existing.midtermScore = record.midtermScore ?? existing.midtermScore ?? 0;
        existing.finalScore = record.finalScore ?? existing.finalScore ?? 0;
        results.push(await this.saveGradeRecord(existing));
      } else {
        const created = this.gradeRepo.create({
          student: { id: record.studentId },
          course: { id: courseId },
          assignmentScore: record.assignmentScore ?? 0,
          midtermScore: record.midtermScore ?? 0,
          finalScore: record.finalScore ?? 0,
        });
        results.push(await this.saveGradeRecord(created));
      }
    }

    return results;
  }

  async getGradesByCourse(courseId: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['teacher', 'teacher.user'],
    });
    if (!course) throw new AppError('Course not found', 404);

    // Get all existing grades
    const existingGrades = await this.gradeRepo.find({
      where: { course: { id: courseId } },
      relations: ['student', 'student.user', 'course'],
      order: { created_at: 'DESC' },
    });

    const gradeMap = new Map<string, Grade>();
    for (const g of existingGrades) {
      if (g.student?.id) {
        gradeMap.set(g.student.id, g);
      }
    }

    // Get all enrolled students via EnrollmentCourse & Enrollment
    const enrollmentCourseRepo = AppDataSource.getRepository(EnrollmentCourse);
    const enrollmentCourses = await enrollmentCourseRepo.find({
      where: { course: { id: courseId } },
      relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
    });

    const studentMap = new Map<string, any>();
    for (const ec of enrollmentCourses) {
      const student = ec.enrollment?.student;
      if (student && student.id && !studentMap.has(student.id)) {
        studentMap.set(student.id, student);
      }
    }

    const results: any[] = [];

    // Include existing grade records
    for (const g of existingGrades) {
      results.push(g);
      if (g.student?.id) {
        studentMap.delete(g.student.id);
      }
    }

    // For any enrolled students without a grade record, create a transient/default slot
    for (const [studentId, student] of studentMap.entries()) {
      results.push({
        id: `pending_${studentId}`,
        studentId: studentId,
        courseId: courseId,
        assignmentScore: 0,
        midtermScore: 0,
        finalScore: 0,
        totalScore: 0,
        letterGrade: 'F',
        isPublished: false,
        student: student,
        course: course,
      });
    }

    return results;
  }

  private async saveGradeRecord(grade: Grade) {
    const total = this.calculateTotal(grade);
    grade.totalScore = total;
    grade.letterGrade = this.calculateLetterGrade(total);
    return this.gradeRepo.save(grade);
  }

  private calculateTotal(grade: Grade) {
    return (grade.assignmentScore ?? 0) + (grade.midtermScore ?? 0) + (grade.finalScore ?? 0);
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
