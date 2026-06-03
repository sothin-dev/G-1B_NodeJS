import { NextFunction, Request, Response } from "express";

import dashboardService from "../services/dashboard.service";
import { successResponse } from "../utils/api-response";

class DashboardController {
  async getAdminOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getAdminOverview();
      return successResponse(res, "Admin dashboard overview", data);
    } catch (error) {
      next(error);
    }
  }

  async getStudentDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getStudentDashboard((req as any).user.id);
      return successResponse(res, "Student dashboard snapshot", data);
    } catch (error) {
      next(error);
    }
  }

  async getTeacherDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getTeacherDashboard((req as any).user.id);
      return successResponse(res, "Teacher dashboard overview", data);
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentTrend(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getEnrollmentTrend();
      return successResponse(res, "Enrollment trend data", data);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDepartmentStats();
      return successResponse(res, "Department analytics", data);
    } catch (error) {
      next(error);
    }
  }

  async getCourseStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getTopCoursesForActiveSemester();
      return successResponse(res, "Top courses for active semester", data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
