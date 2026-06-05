import { Request, Response, NextFunction } from "express";
import semesterService from "../services/semester.service";
import { successResponse } from "../utils/api-response";
import { SemesterStatus } from "../entities/semester.entity";

class SemesterController {
  async listSemesters(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as SemesterStatus;
      const year = req.query.year ? Number(req.query.year) : undefined;

      const semesters = await semesterService.listSemesters(status, year);
      return successResponse(res, "Semesters retrieved", semesters);
    } catch (error) {
      next(error);
    }
  }

  async createSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.createSemester(req.body);
      return successResponse(res, "Semester created successfully", semester, 201);
    } catch (error) {
      next(error);
    }
  }

  async getSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.getSemester(req.params.id);
      return successResponse(res, "Semester retrieved", semester);
    } catch (error) {
      next(error);
    }
  }

  async updateSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.updateSemester(req.params.id, req.body);
      return successResponse(res, "Semester updated successfully", semester);
    } catch (error) {
      next(error);
    }
  }

  async deleteSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await semesterService.deleteSemester(req.params.id);
      return successResponse(res, result.message);
    } catch (error) {
      next(error);
    }
  }

  async openEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.openEnrollment(req.params.id);
      return successResponse(res, "Semester enrollment opened", semester);
    } catch (error) {
      next(error);
    }
  }

  async closeEnrollment(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.closeEnrollment(req.params.id);
      return successResponse(res, "Semester enrollment closed", semester);
    } catch (error) {
      next(error);
    }
  }

  async getActiveSemester(req: Request, res: Response, next: NextFunction) {
    try {
      const semester = await semesterService.getActiveSemester();
      return successResponse(res, "Active semester retrieved", semester);
    } catch (error) {
      next(error);
    }
  }
}

export default new SemesterController();
