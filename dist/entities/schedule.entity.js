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
exports.Schedule = void 0;
const typeorm_1 = require("typeorm");
const baseEntity_1 = require("./baseEntity");
const course_entity_1 = require("./course.entity");
let Schedule = class Schedule extends baseEntity_1.BaseEntity {
};
exports.Schedule = Schedule;
__decorate([
    (0, typeorm_1.Column)({ name: 'course_id' }),
    __metadata("design:type", String)
], Schedule.prototype, "courseId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "day", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], Schedule.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'end_time', type: 'time' }),
    __metadata("design:type", String)
], Schedule.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Schedule.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, course => course.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], Schedule.prototype, "course", void 0);
exports.Schedule = Schedule = __decorate([
    (0, typeorm_1.Entity)('schedules')
], Schedule);
