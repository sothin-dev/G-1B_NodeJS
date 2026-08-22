import { Request, Response, NextFunction } from 'express';
import gradeService from '../services/grade.service';
import { successResponse } from '../utils/api-response';
import { AppDataSource } from '../config/database';
import { Student } from '../entities/student.entity';
import { AppError } from '../core/errors/app-error';

class GradeController {
  private async resolveCurrentStudentId(req: Request): Promise<string | null> {
    const user = (req as any).user;

    if (user?.role !== 'STUDENT') {
      return null;
    }

    if (!user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const student = await AppDataSource.getRepository(Student).findOne({
      where: { user: { id: user.id } },
    });

    if (!student) {
      throw new AppError('Student profile not found for this account', 404);
    }

    return String(student.id);
  }

  async listGrades(req: Request, res: Response, next: NextFunction) {
    try {
      let studentId = req.query.studentId as string | undefined;

      const currentStudentId = await this.resolveCurrentStudentId(req);
      if (currentStudentId) {
        studentId = currentStudentId;
      }

      const result = await gradeService.listGrades({
        courseId: req.query.courseId as string | undefined,
        studentId,
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
      const currentStudentId = await this.resolveCurrentStudentId(req);

      if (currentStudentId && result.studentId !== currentStudentId) {
        throw new AppError('Forbidden', 403);
      }

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
