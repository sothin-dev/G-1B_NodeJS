"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule_repository_1 = __importDefault(require("../repository/schedule.repository"));
const course_repository_1 = __importDefault(require("../repository/course.repository"));
const app_error_1 = require("../core/errors/app-error");
const schedule_entity_1 = require("../entities/schedule.entity");
class ScheduleService {
    async listSchedules(filters) {
        return schedule_repository_1.default.listSchedules(filters);
    }
    async getScheduleDetails(id) {
        const schedule = await schedule_repository_1.default.findWithRelations(id);
        if (!schedule) {
            throw new app_error_1.AppError("Schedule not found", 404);
        }
        return schedule;
    }
    async createSchedule(data) {
        const course = await course_repository_1.default.findById(data.course_id);
        if (!course) {
            throw new app_error_1.AppError("Course not found", 404);
        }
        const conflictCheck = await schedule_repository_1.default.checkConflict({
            day: data.day,
            startTime: data.start_time,
            endTime: data.end_time,
            room: data.room,
        });
        if (conflictCheck.hasConflict) {
            throw new app_error_1.AppError(`Schedule conflict: Room ${data.room} is already booked on ${data.day} during this time slot`, 409);
        }
        const schedule = new schedule_entity_1.Schedule();
        schedule.courseId = data.course_id;
        schedule.day = data.day;
        schedule.startTime = data.start_time;
        schedule.endTime = data.end_time;
        schedule.room = data.room;
        return schedule_repository_1.default.saveSchedule(schedule);
    }
    async updateSchedule(id, data) {
        const schedule = await schedule_repository_1.default.findById(id);
        if (!schedule) {
            throw new app_error_1.AppError("Schedule not found", 404);
        }
        if (data.day !== undefined ||
            data.start_time !== undefined ||
            data.end_time !== undefined ||
            data.room !== undefined) {
            const day = data.day ?? schedule.day;
            const startTime = data.start_time ?? schedule.startTime;
            const endTime = data.end_time ?? schedule.endTime;
            const room = data.room ?? schedule.room;
            const conflictCheck = await schedule_repository_1.default.checkConflict({
                day,
                startTime,
                endTime,
                room,
                excludeScheduleId: id,
            });
            if (conflictCheck.hasConflict) {
                throw new app_error_1.AppError(`Schedule conflict: Room ${room} is already booked on ${day} during this time slot`, 409);
            }
            schedule.day = day;
            schedule.startTime = startTime;
            schedule.endTime = endTime;
            schedule.room = room;
        }
        return schedule_repository_1.default.saveSchedule(schedule);
    }
    async deleteSchedule(id) {
        const schedule = await schedule_repository_1.default.findById(id);
        if (!schedule) {
            throw new app_error_1.AppError("Schedule not found", 404);
        }
        await schedule_repository_1.default.delete(id);
        return { message: "Schedule deleted successfully" };
    }
    async checkConflict(data) {
        const result = await schedule_repository_1.default.checkConflict({
            day: data.day,
            startTime: data.start_time,
            endTime: data.end_time,
            room: data.room,
        });
        return {
            hasConflict: result.hasConflict,
            message: result.hasConflict
                ? `Conflict found: ${result.conflicts.length} existing schedule(s) overlap`
                : "No conflicts",
            conflicts: result.conflicts.map((c) => ({
                id: c.id,
                day: c.day,
                startTime: c.startTime,
                endTime: c.endTime,
                room: c.room,
                courseId: c.courseId,
            })),
        };
    }
}
exports.default = new ScheduleService();
