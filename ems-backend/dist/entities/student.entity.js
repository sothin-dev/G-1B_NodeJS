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
exports.Student = exports.StudentStatus = void 0;
const typeorm_1 = require("typeorm");
const department_entity_1 = require("./department.entity");
const user_entity_1 = require("./user.entity");
const enrollment_entity_1 = require("./enrollment.entity");
const grade_entity_1 = require("./grade.entity");
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["ACTIVE"] = "ACTIVE";
    StudentStatus["SUSPENDED"] = "SUSPENDED";
    StudentStatus["GRADUATED"] = "GRADUATED";
    StudentStatus["DROPPED"] = "DROPPED";
})(StudentStatus || (exports.StudentStatus = StudentStatus = {}));
let Student = class Student {
};
exports.Student = Student;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Student.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Student.prototype, "student_number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "first_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Student.prototype, "last_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Student.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id', nullable: true }),
    __metadata("design:type", Number)
], Student.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE }),
    __metadata("design:type", String)
], Student.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Student.prototype, "enrollment_year", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => department_entity_1.Department, department => department.students),
    (0, typeorm_1.JoinColumn)({ name: 'department_id' }),
    __metadata("design:type", department_entity_1.Department)
], Student.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.student),
    (0, typeorm_1.JoinColumn)({ name: 'id' }) // shares same primary key as users
    ,
    __metadata("design:type", user_entity_1.User)
], Student.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => enrollment_entity_1.Enrollment, enrollment => enrollment.student),
    __metadata("design:type", Array)
], Student.prototype, "enrollments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => grade_entity_1.Grade, grade => grade.student),
    __metadata("design:type", Array)
], Student.prototype, "grades", void 0);
exports.Student = Student = __decorate([
    (0, typeorm_1.Entity)('students')
], Student);
