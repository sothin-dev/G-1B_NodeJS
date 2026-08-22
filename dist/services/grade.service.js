"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GradeService = void 0;
const database_1 = require("../config/database");
const grade_entity_1 = require("../entities/grade.entity");
const course_entity_1 = require("../entities/course.entity");
const student_entity_1 = require("../entities/student.entity");
const enrollment_course_entity_1 = require("../entities/enrollment-course.entity");
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
            assignmentScore: data.assignmentScore ?? 0,
            midtermScore: data.midtermScore ?? 0,
            finalScore: data.finalScore ?? 0,
        });
        return this.saveGradeRecord(grade);
    }
    async updateGrade(gradeId, data) {
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
        if (data.assignmentScore !== undefined)
            grade.assignmentScore = data.assignmentScore;
        if (data.midtermScore !== undefined)
            grade.midtermScore = data.midtermScore;
        if (data.finalScore !== undefined)
            grade.finalScore = data.finalScore;
        return this.saveGradeRecord(grade);
    }
    async deleteGrade(gradeId) {
        const grade = await this.getGrade(gradeId);
        await this.gradeRepo.remove(grade);
        return { message: 'Grade deleted successfully' };
    }
    async publishGrade(gradeId) {
        const grade = await this.getGrade(gradeId);
        grade.letterGrade = this.calculateLetterGrade(grade.totalScore ?? this.calculateTotal(grade));
        grade.isPublished = true;
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
                existing.assignmentScore = record.assignmentScore ?? existing.assignmentScore ?? 0;
                existing.midtermScore = record.midtermScore ?? existing.midtermScore ?? 0;
                existing.finalScore = record.finalScore ?? existing.finalScore ?? 0;
                results.push(await this.saveGradeRecord(existing));
            }
            else {
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
    async getGradesByCourse(courseId) {
        const course = await this.courseRepo.findOne({
            where: { id: courseId },
            relations: ['teacher', 'teacher.user'],
        });
        if (!course)
            throw new app_error_1.AppError('Course not found', 404);
        // Get all existing grades
        const existingGrades = await this.gradeRepo.find({
            where: { course: { id: courseId } },
            relations: ['student', 'student.user', 'course'],
            order: { created_at: 'DESC' },
        });
        const gradeMap = new Map();
        for (const g of existingGrades) {
            if (g.student?.id) {
                gradeMap.set(g.student.id, g);
            }
        }
        // Get all enrolled students via EnrollmentCourse & Enrollment
        const enrollmentCourseRepo = database_1.AppDataSource.getRepository(enrollment_course_entity_1.EnrollmentCourse);
        const enrollmentCourses = await enrollmentCourseRepo.find({
            where: { course: { id: courseId } },
            relations: ['enrollment', 'enrollment.student', 'enrollment.student.user'],
        });
        const studentMap = new Map();
        for (const ec of enrollmentCourses) {
            const student = ec.enrollment?.student;
            if (student && student.id && !studentMap.has(student.id)) {
                studentMap.set(student.id, student);
            }
        }
        const results = [];
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
    async saveGradeRecord(grade) {
        const total = this.calculateTotal(grade);
        grade.totalScore = total;
        grade.letterGrade = this.calculateLetterGrade(total);
        return this.gradeRepo.save(grade);
    }
    calculateTotal(grade) {
        return (grade.assignmentScore ?? 0) + (grade.midtermScore ?? 0) + (grade.finalScore ?? 0);
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
