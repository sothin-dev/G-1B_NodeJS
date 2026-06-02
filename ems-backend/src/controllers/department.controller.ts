import { Request, Response, NextFunction } from "express";

import departmentService from "../services/department.service";

import { successResponse } from "../utils/api-response";

class DepartmentController {
  async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.getAllDepartments();
      return successResponse(res, "Departments retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.createDepartment(req.body);
      return successResponse(res, "Department created", data, 201);
    } catch (error) {
      next(error);
    }
  }

  async getDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.getDepartment(req.params.id);
      return successResponse(res, "Department retrieved", data);
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.updateDepartment(
        req.params.id,
        req.body,
      );
      return successResponse(res, "Department updated", data);
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.deleteDepartment(req.params.id);
      return successResponse(res, data.message);
    } catch (error) {
      next(error);
    }
  }

  async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.listCourses(req.params.id);
      return successResponse(res, "Department courses", data);
    } catch (error) {
      next(error);
    }
  }

  async listTeachers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await departmentService.listTeachers(req.params.id);
      return successResponse(res, "Department teachers", data);
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
