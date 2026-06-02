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
const typeorm_1 = require("typeorm");
const enrollment_entity_1 = require("./enrollment.entity");
const course_entity_1 = require("./course.entity");
let EnrollmentCourse = class EnrollmentCourse {
};
exports.EnrollmentCourse = EnrollmentCourse;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], EnrollmentCourse.prototype, "enrollment_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", String)
], EnrollmentCourse.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => enrollment_entity_1.Enrollment, enrollment => enrollment.enrollmentCourses),
    (0, typeorm_1.JoinColumn)({ name: 'enrollment_id' }),
    __metadata("design:type", enrollment_entity_1.Enrollment)
], EnrollmentCourse.prototype, "enrollment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, course => course.enrollmentCourses),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], EnrollmentCourse.prototype, "course", void 0);
exports.EnrollmentCourse = EnrollmentCourse = __decorate([
    (0, typeorm_1.Entity)('enrollment_courses')
], EnrollmentCourse);
