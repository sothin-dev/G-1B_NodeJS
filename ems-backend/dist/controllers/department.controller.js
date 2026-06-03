"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDepartment = exports.updateDepartment = exports.getDepartment = exports.listDepartments = exports.createDepartment = void 0;
const department_service_1 = require("../services/department.service");
const departmentService = new department_service_1.DepartmentService();
const createDepartment = async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name || !code) {
            res.status(400).json({ success: false, message: 'name and code are required' });
            return;
        }
        const department = await departmentService.createDepartment({ name, code });
        res.status(201).json({ success: true, data: department });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Unable to create department' });
    }
};
exports.createDepartment = createDepartment;
const listDepartments = async (_req, res) => {
    try {
        const departments = await departmentService.listDepartments();
        res.status(200).json({ success: true, data: departments });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to list departments' });
    }
};
exports.listDepartments = listDepartments;
const getDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await departmentService.getDepartmentById(Number(id));
        res.status(200).json({ success: true, data: department });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message || 'Department not found' });
    }
};
exports.getDepartment = getDepartment;
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;
        if (!name && !code) {
            res.status(400).json({ success: false, message: 'At least one of name or code is required' });
            return;
        }
        const department = await departmentService.updateDepartment(Number(id), { name, code });
        res.status(200).json({ success: true, data: department });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Unable to update department' });
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        await departmentService.deleteDepartment(Number(id));
        res.status(200).json({ success: true, message: 'Department deleted successfully' });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message || 'Department not found' });
    }
};
exports.deleteDepartment = deleteDepartment;
