import { Request, Response, NextFunction } from 'express';
import gradeService from '../services/grade.service';
import { successResponse } from '../utils/api-response';

class GradeController {
  async listGrades(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.listGrades({
        courseId: req.query.courseId as string | undefined,
        studentId: req.query.studentId as string | undefined,
      });

      return successResponse(res, 'List of grades', result);
    } catch (error) {
      next(error);
    }
  }

  async createGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.createGrade(req.body);
      return successResponse(res, 'Grade uploaded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.getGrade(req.params.id);
      return successResponse(res, 'Grade details', result);
    } catch (error) {
      next(error);
    }
  }

  async updateGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.updateGrade(req.params.id, req.body);
      return successResponse(res, 'Grade updated successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async deleteGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.deleteGrade(req.params.id);
      return successResponse(res, 'Grade deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async publishGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.publishGrade(req.params.id);
      return successResponse(res, 'Grades published', result);
    } catch (error) {
      next(error);
    }
  }

  async bulkUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.bulkUpload(req.body.courseId, req.body.records ?? []);
      return successResponse(res, 'Bulk grades uploaded successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getGradesByCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gradeService.getGradesByCourse(req.params.courseId);
      return successResponse(res, 'Course grades', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new GradeController();
