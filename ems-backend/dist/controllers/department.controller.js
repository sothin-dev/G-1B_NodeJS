"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const department_service_1 = require("../services/department.service");
const svc = new department_service_1.DepartmentService();
exports.DepartmentController = {
    getAll: async (req, res, next) => {
        try {
            const { search } = req.query;
            const data = await svc.getAll(search);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    getOne: async (req, res, next) => {
        try {
            const data = await svc.getOne(req.params.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    create: async (req, res, next) => {
        try {
            const data = await svc.create(req.body);
            res.status(201).json({ success: true, message: "Department created", data });
        }
        catch (e) {
            next(e);
        }
    },
    update: async (req, res, next) => {
        try {
            const data = await svc.update(req.params.id, req.body);
            res.json({ success: true, message: "Department updated", data });
        }
        catch (e) {
            next(e);
        }
    },
    remove: async (req, res, next) => {
        try {
            const data = await svc.delete(req.params.id);
            res.json({ success: true, message: data.message });
        }
        catch (e) {
            next(e);
        }
    },
    getCourses: async (req, res, next) => {
        try {
            const data = await svc.getCourses(req.params.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    getTeachers: async (req, res, next) => {
        try {
            const data = await svc.getTeachers(req.params.id);
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
};
