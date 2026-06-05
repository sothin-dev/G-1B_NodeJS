import { Request, Response, NextFunction } from "express";
import scheduleService from "../services/schedule.service";
import { successResponse } from "../utils/api-response";

class ScheduleController {
  async listSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const courseId = req.query.courseId as string;
      const day = req.query.day as string;
      const room = req.query.room as string;

      const schedules = await scheduleService.listSchedules({
        courseId,
        day,
        room,
      });

      return successResponse(res, "Schedules retrieved", schedules);
    } catch (error) {
      next(error);
    }
  }

  async getScheduleDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.getScheduleDetails(req.params.id);
      return successResponse(res, "Schedule details retrieved", schedule);
    } catch (error) {
      next(error);
    }
  }

  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.createSchedule(req.body);
      return successResponse(res, "Schedule created successfully", schedule, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.updateSchedule(req.params.id, req.body);
      return successResponse(res, "Schedule updated successfully", schedule);
    } catch (error) {
      next(error);
    }
  }

  async deleteSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await scheduleService.deleteSchedule(req.params.id);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async checkConflict(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await scheduleService.checkConflict(req.body);
      return successResponse(res, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ScheduleController();
