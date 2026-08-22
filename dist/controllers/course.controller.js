"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const course_service_1 = __importDefault(require("../services/course.service"));
const api_response_1 = require("../utils/api-response");
class CourseController {
    /**
     * list all courses
     */
    async listCourses(req, res, next) {
        try {
            const search = req.query.search;
            const departmentId = req.query.departmentId;
            const teacherId = req.query.teacherId;
            const semesterId = req.query.semesterId;
            const courses = await course_service_1.default.listCourses({
                search,
                departmentId,
                teacherId,
                semesterId,
            });
            return (0, api_response_1.successResponse)(res, "Courses retrieved", courses);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get course details including schedules
     */
    async getCourseDetails(req, res, next) {
        try {
            const course = await course_service_1.default.getCourseDetails(req.params.id);
            return (0, api_response_1.successResponse)(res, "Course details retrieved", course);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Update course info
     */
    async updateCourse(req, res, next) {
        try {
            const course = await course_service_1.default.updateCourse(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "Course updated successfully", course);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a course
     */
    async deleteCourse(req, res, next) {
        try {
            const result = await course_service_1.default.deleteCourse(req.params.id);
            return (0, api_response_1.successResponse)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List enrolled students for a course
     */
    async listCourseStudents(req, res, next) {
        try {
            const students = await course_service_1.default.listCourseStudents(req.params.id);
            return (0, api_response_1.successResponse)(res, "Course students retrieved", students);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get schedule slots for a course
     */
    async listCourseSchedules(req, res, next) {
        try {
            const schedules = await course_service_1.default.listCourseSchedules(req.params.id);
            return (0, api_response_1.successResponse)(res, "Course schedules retrieved", schedules);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Create Course
     */
    async createCourse(req, res, next) {
        try {
            const course = await course_service_1.default.create(req.body);
            return (0, api_response_1.successResponse)(res, "The course is created successfully", course, 201);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new CourseController();
