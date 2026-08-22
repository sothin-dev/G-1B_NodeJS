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
exports.Grade = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const student_entity_1 = require("./student.entity");
const course_entity_1 = require("./course.entity");
let Grade = class Grade extends baseEntity_1.BaseEntity {
};
exports.Grade = Grade;
__decorate([
    (0, typeorm_1.Column)({ name: 'student_id' }),
    __metadata("design:type", String)
], Grade.prototype, "studentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'course_id' }),
    __metadata("design:type", String)
], Grade.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assignment_score', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "assignmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'midterm_score', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "midtermScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_score', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "finalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_score', type: 'float', nullable: true }),
    __metadata("design:type", Number)
], Grade.prototype, "totalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'grade', type: 'char', length: 2, nullable: true }),
    __metadata("design:type", String)
], Grade.prototype, "letterGrade", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_published', default: false }),
    __metadata("design:type", Boolean)
], Grade.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, student => student.grades),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], Grade.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, course => course.grades),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], Grade.prototype, "course", void 0);
exports.Grade = Grade = __decorate([
    (0, typeorm_1.Entity)('grades')
], Grade);
