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
exports.EnrollmentCourse = void 0;
// src/models/EnrollmentCourse.ts
const typeorm_1 = require("typeorm");
const Enrollment_1 = require("./Enrollment");
const Course_1 = require("./Course");
let EnrollmentCourse = class EnrollmentCourse {
};
exports.EnrollmentCourse = EnrollmentCourse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EnrollmentCourse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Enrollment_1.Enrollment, (enrollment) => enrollment.enrollmentCourses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'enrollment_id' }),
    __metadata("design:type", Enrollment_1.Enrollment)
], EnrollmentCourse.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.enrollmentCourses),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", Course_1.Course)
], EnrollmentCourse.prototype, "course", void 0);
exports.EnrollmentCourse = EnrollmentCourse = __decorate([
    (0, typeorm_1.Entity)('enrollment_courses')
], EnrollmentCourse);
