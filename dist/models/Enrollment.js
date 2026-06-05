"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = void 0;
// src/models/Enrollment.ts
const typeorm_1 = require("typeorm");
const Student_1 = require("./Student");
const Semester_1 = require("./Semester");
const EnrollmentCourse_1 = require("./EnrollmentCourse");
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Enrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' }),
    __metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_credits', default: 0 }),
    __metadata("design:type", Number)
], Enrollment.prototype, "total_credits", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Enrollment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Student_1.Student, (student) => student.enrollments),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", Student_1.Student)
], Enrollment.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Semester_1.Semester, (semester) => semester.enrollments),
    (0, typeorm_1.JoinColumn)({ name: 'semester_id' }),
    __metadata("design:type", Semester_1.Semester)
], Enrollment.prototype, "semester", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => EnrollmentCourse_1.EnrollmentCourse, (ec) => ec.enrollment, { cascade: true }),
    __metadata("design:type", Array)
], Enrollment.prototype, "enrollmentCourses", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, typeorm_1.Entity)('enrollments')
], Enrollment);
