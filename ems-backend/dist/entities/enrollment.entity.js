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
exports.Enrollment = exports.EnrollmentStatus = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("./student.entity");
const semester_entity_1 = require("./semester.entity");
const enrollment_course_entity_1 = require("./enrollment-course.entity");
var EnrollmentStatus;
(function (EnrollmentStatus) {
    EnrollmentStatus["PENDING"] = "PENDING";
    EnrollmentStatus["APPROVED"] = "APPROVED";
    EnrollmentStatus["REJECTED"] = "REJECTED";
    EnrollmentStatus["CANCELLED"] = "CANCELLED";
})(EnrollmentStatus || (exports.EnrollmentStatus = EnrollmentStatus = {}));
let Enrollment = class Enrollment {
};
exports.Enrollment = Enrollment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Enrollment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'student_id' }),
    __metadata("design:type", Number)
], Enrollment.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'semester_id' }),
    __metadata("design:type", Number)
], Enrollment.prototype, "semesterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING }),
    __metadata("design:type", String)
], Enrollment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Enrollment.prototype, "total_credits", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, student => student.enrollments),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], Enrollment.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => semester_entity_1.Semester, semester => semester.enrollments),
    (0, typeorm_1.JoinColumn)({ name: 'semester_id' }),
    __metadata("design:type", semester_entity_1.Semester)
], Enrollment.prototype, "semester", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => enrollment_course_entity_1.EnrollmentCourse, ec => ec.enrollment),
    __metadata("design:type", Array)
], Enrollment.prototype, "enrollmentCourses", void 0);
exports.Enrollment = Enrollment = __decorate([
    (0, typeorm_1.Entity)('enrollments')
], Enrollment);
