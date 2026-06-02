import { Request, Response, NextFunction } from "express";
import { DepartmentService } from "../services/department.service";

const svc = new DepartmentService();

export const DepartmentController = {

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      const data = await svc.getAll(search as string | undefined);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.getOne(req.params.id);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.create(req.body);
      res.status(201).json({ success: true, message: "Department created", data });
    } catch (e) { next(e); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.update(req.params.id, req.body);
      res.json({ success: true, message: "Department updated", data });
    } catch (e) { next(e); }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.delete(req.params.id);
      res.json({ success: true, message: data.message });
    } catch (e) { next(e); }
  },

  getCourses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.getCourses(req.params.id);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  getTeachers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await svc.getTeachers(req.params.id);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },
};
