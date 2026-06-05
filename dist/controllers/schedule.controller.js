"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schedule_service_1 = __importDefault(require("../services/schedule.service"));
const api_response_1 = require("../utils/api-response");
class ScheduleController {
    async listSchedules(req, res, next) {
        try {
            const courseId = req.query.courseId;
            const day = req.query.day;
            const room = req.query.room;
            const schedules = await schedule_service_1.default.listSchedules({
                courseId,
                day,
                room,
            });
            return (0, api_response_1.successResponse)(res, "Schedules retrieved", schedules);
        }
        catch (error) {
            next(error);
        }
    }
    async getScheduleDetails(req, res, next) {
        try {
            const schedule = await schedule_service_1.default.getScheduleDetails(req.params.id);
            return (0, api_response_1.successResponse)(res, "Schedule details retrieved", schedule);
        }
        catch (error) {
            next(error);
        }
    }
    async createSchedule(req, res, next) {
        try {
            const schedule = await schedule_service_1.default.createSchedule(req.body);
            return (0, api_response_1.successResponse)(res, "Schedule created successfully", schedule, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async updateSchedule(req, res, next) {
        try {
            const schedule = await schedule_service_1.default.updateSchedule(req.params.id, req.body);
            return (0, api_response_1.successResponse)(res, "Schedule updated successfully", schedule);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSchedule(req, res, next) {
        try {
            const result = await schedule_service_1.default.deleteSchedule(req.params.id);
            return (0, api_response_1.successResponse)(res, result.message);
        }
        catch (error) {
            next(error);
        }
    }
    async checkConflict(req, res, next) {
        try {
            const result = await schedule_service_1.default.checkConflict(req.body);
            return (0, api_response_1.successResponse)(res, result.message, result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ScheduleController();
