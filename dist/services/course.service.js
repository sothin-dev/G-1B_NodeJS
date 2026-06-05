"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const course_repository_1 = __importDefault(require("../repository/course.repository"));
const teacher_repository_1 = __importDefault(require("../repository/teacher.repository"));
const department_repository_1 = __importDefault(require("../repository/department.repository"));
const app_error_1 = require("../core/errors/app-error");
const enrollment_course_repository_1 = __importDefault(require("../repository/enrollment-course.repository"));
class CourseService {
    async listCourses(filters) {
        return course_repository_1.default.listCourses(filters);
    }
    async getCourseDetails(id) {
        const course = await course_repository_1.default.findWithRelations(id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        return course;
    }
    async updateCourse(id, data) {
        const course = await course_repository_1.default.findById(id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        if (data.teacher_id) {
            const teacher = await teacher_repository_1.default.findById(data.teacher_id);
            if (!teacher) {
                throw new app_error_1.AppError("Teacher not found", 404);
            }
            course.teacher = teacher;
        }
        if (data.name !== undefined) {
            course.name = data.name;
        }
        if (data.credit !== undefined) {
            course.credit = data.credit;
        }
        if (data.capacity !== undefined) {
            course.capacity = data.capacity;
        }
        return course_repository_1.default.saveCourse(course);
    }
    async deleteCourse(id) {
        const course = await course_repository_1.default.findById(id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        const enrolledCount = await enrollment_course_repository_1.default.courseEnrollmentCount(id);
        if (enrolledCount > 0) {
            throw new app_error_1.AppError("Cannot delete course with enrolled students", 400);
        }
        await course_repository_1.default.delete(id);
        return { message: "Course deleted successfully" };
    }
    async listCourseStudents(id) {
        const course = await course_repository_1.default.findById(id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        return enrollment_course_repository_1.default.listCourseStudents(id);
    }
    async listCourseSchedules(id) {
        const course = await course_repository_1.default.findWithRelations(id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        return course.schedules || [];
    }
    async create(data) {
        const existing = await course_repository_1.default.findByCode(data.code);
        if (existing) {
            throw new app_error_1.AppError("Course code already exists", 409);
        }
        const department = await department_repository_1.default.findById(data.department_id);
        if (!department) {
            throw new app_error_1.AppError("Department not found", 404);
        }
        const teacher = await teacher_repository_1.default.findById(data.teacher_id);
        if (!teacher) {
            throw new app_error_1.AppError("Teacher not found", 404);
        }
        return course_repository_1.default.create({
            name: data.name,
            code: data.code,
            credit: data.credit,
            capacity: data.capacity,
            department,
            teacher,
        });
    }
}
exports.default = new CourseService();
