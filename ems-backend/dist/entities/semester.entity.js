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
exports.Semester = exports.SemesterStatus = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const enrollment_entity_1 = require("./enrollment.entity");
var SemesterStatus;
(function (SemesterStatus) {
    SemesterStatus["UPCOMING"] = "UPCOMING";
    SemesterStatus["ACTIVE"] = "ACTIVE";
    SemesterStatus["CLOSED"] = "CLOSED";
})(SemesterStatus || (exports.SemesterStatus = SemesterStatus = {}));
let Semester = class Semester extends baseEntity_1.BaseEntity {
};
exports.Semester = Semester;
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Semester.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Semester.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SemesterStatus, default: SemesterStatus.UPCOMING }),
    __metadata("design:type", String)
], Semester.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Semester.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Semester.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => enrollment_entity_1.Enrollment, enrollment => enrollment.semester),
    __metadata("design:type", Array)
], Semester.prototype, "enrollments", void 0);
exports.Semester = Semester = __decorate([
    (0, typeorm_1.Entity)('semesters')
], Semester);
