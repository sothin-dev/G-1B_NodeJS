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
exports.Teacher = void 0;
// src/models/Teacher.ts
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Department_1 = require("./Department");
const Course_1 = require("./Course");
let Teacher = class Teacher {
};
exports.Teacher = Teacher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Teacher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], Teacher.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Department_1.Department, (department) => department.teachers),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", Department_1.Department)
], Teacher.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Course_1.Course, (course) => course.teacher),
    __metadata("design:type", Array)
], Teacher.prototype, "courses", void 0);
exports.Teacher = Teacher = __decorate([
    (0, typeorm_1.Entity)('teachers')
], Teacher);
