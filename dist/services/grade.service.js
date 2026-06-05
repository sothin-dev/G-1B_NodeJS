"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
const database_1 = require("../config/database");
const grade_entity_1 = require("../entities/grade.entity");
const course_entity_1 = require("../entities/course.entity");
const student_entity_1 = require("../entities/student.entity");
const app_error_1 = require("../core/errors/app-error");
class GradeService {
    constructor() {
        this.gradeRepo = database_1.AppDataSource.getRepository(grade_entity_1.Grade);
        this.courseRepo = database_1.AppDataSource.getRepository(course_entity_1.Course);
        this.studentRepo = database_1.AppDataSource.getRepository(student_entity_1.Student);
    }
    async listGrades(filters = {}) {
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
    async getGrade(gradeId) {
        const grade = await this.gradeRepo.findOne({
            where: { id: gradeId },
            relations: ['course', 'student', 'student.user'],
        });
        if (!grade)
            throw new app_error_1.AppError('Grade not found', 404);
        return grade;
    }
    async createGrade(data) {
        const student = await this.studentRepo.findOne({ where: { id: data.studentId } });
        if (!student)
            throw new app_error_1.AppError('Student not found', 404);
        const course = await this.courseRepo.findOne({ where: { id: data.courseId } });
        if (!course)
            throw new app_error_1.AppError('Course not found', 404);
        const existing = await this.gradeRepo.findOne({
            where: { student: { id: data.studentId }, course: { id: data.courseId } },
        });
        if (existing)
            throw new app_error_1.AppError('Grade record already exists for this student and course', 409);
        const grade = this.gradeRepo.create({
            student: { id: data.studentId },
            course: { id: data.courseId },
            assignment_score: data.assignment_score ?? 0,
            midterm_score: data.midterm_score ?? 0,
            final_score: data.final_score ?? 0,
        });
        return this.saveGradeRecord(grade);
    }
    async updateGrade(gradeId, data) {
        const grade = await this.getGrade(gradeId);
        if (data.assignment_score !== undefined)
            grade.assignment_score = data.assignment_score;
        if (data.midterm_score !== undefined)
            grade.midterm_score = data.midterm_score;
        if (data.final_score !== undefined)
            grade.final_score = data.final_score;
        return this.saveGradeRecord(grade);
    }
    async deleteGrade(gradeId) {
        const grade = await this.getGrade(gradeId);
        await this.gradeRepo.remove(grade);
        return { message: 'Grade deleted successfully' };
    }
    async publishGrade(gradeId) {
        const grade = await this.getGrade(gradeId);
        grade.grade = this.calculateLetterGrade(grade.total_score ?? this.calculateTotal(grade));
        return this.gradeRepo.save(grade);
    }
    async bulkUpload(courseId, records) {
        const course = await this.courseRepo.findOne({ where: { id: courseId } });
        if (!course)
            throw new app_error_1.AppError('Course not found', 404);
        const results = [];
        for (const record of records) {
            const existing = await this.gradeRepo.findOne({
                where: { student: { id: record.studentId }, course: { id: courseId } },
            });
            if (existing) {
                existing.assignment_score = record.assignment_score ?? existing.assignment_score ?? 0;
                existing.midterm_score = record.midterm_score ?? existing.midterm_score ?? 0;
                existing.final_score = record.final_score ?? existing.final_score ?? 0;
                results.push(await this.saveGradeRecord(existing));
            }
            else {
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
    async getGradesByCourse(courseId) {
        return this.gradeRepo.find({
            where: { course: { id: courseId } },
            relations: ['student', 'student.user', 'course'],
            order: { created_at: 'DESC' },
        });
    }
    async saveGradeRecord(grade) {
        const total = this.calculateTotal(grade);
        grade.total_score = total;
        grade.grade = this.calculateLetterGrade(total);
        return this.gradeRepo.save(grade);
    }
    calculateTotal(grade) {
        return (grade.assignment_score ?? 0) + (grade.midterm_score ?? 0) + (grade.final_score ?? 0);
    }
    calculateLetterGrade(total) {
        if (total >= 90)
            return 'A';
        if (total >= 80)
            return 'B';
        if (total >= 70)
            return 'C';
        if (total >= 60)
            return 'D';
        return 'F';
    }
}
exports.GradeService = GradeService;
exports.default = new GradeService();
