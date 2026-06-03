"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRepository = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("../entities/course.entity");
const database_1 = require("../config/database");
class CourseRepository {
    constructor() {
        this.repo = database_1.AppDataSource.getRepository(course_entity_1.Course);
    }
    async findById(id) {
        return await this.repo.findOne({ where: { id }, relations: ['schedules'] });
    }
    async findByIds(ids) {
        return await this.repo.find({ where: { id: (0, typeorm_1.In)(ids) }, relations: ['schedules'] });
    }
    async getSchedulesForCourses(courseIds) {
        const courses = await this.repo.find({
            where: { id: (0, typeorm_1.In)(courseIds) },
            relations: ['schedules'],
        });
        return courses.flatMap(c => c.schedules.map(s => ({ ...s, course_name: c.name })));
    }
}
exports.CourseRepository = CourseRepository;
