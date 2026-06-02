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
// src/models/Grade.ts
const typeorm_1 = require("typeorm");
const Student_1 = require("./Student");
const Course_1 = require("./Course");
let Grade = class Grade {
};
exports.Grade = Grade;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Grade.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assignment_score', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "assignmentScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'midterm_score', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "midtermScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'final_score', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "finalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_score', type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Grade.prototype, "totalScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Grade.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Student_1.Student),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", Student_1.Student)
], Grade.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Course_1.Course, (course) => course.grades),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", Course_1.Course)
], Grade.prototype, "course", void 0);
exports.Grade = Grade = __decorate([
    (0, typeorm_1.Entity)('grades')
], Grade);
