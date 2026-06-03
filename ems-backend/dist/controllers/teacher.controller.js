"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTeacher = exports.updateTeacher = exports.getTeacher = exports.listTeachers = exports.createTeacher = void 0;
const teacher_service_1 = require("../services/teacher.service");
const teacherService = new teacher_service_1.TeacherService();
const createTeacher = async (req, res) => {
    try {
        const { user_id, department_id } = req.body;
        if (!user_id) {
            res.status(400).json({ success: false, message: 'user_id is required' });
            return;
        }
        const teacher = await teacherService.createTeacher({
            userId: Number(user_id),
            departmentId: department_id ? Number(department_id) : undefined,
        });
        res.status(201).json({ success: true, data: teacher });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Unable to create teacher' });
    }
};
exports.createTeacher = createTeacher;
const listTeachers = async (_req, res) => {
    try {
        const teachers = await teacherService.listTeachers();
        res.status(200).json({ success: true, data: teachers });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Unable to list teachers' });
    }
};
exports.listTeachers = listTeachers;
const getTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await teacherService.getTeacherById(Number(id));
        res.status(200).json({ success: true, data: teacher });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message || 'Teacher not found' });
    }
};
exports.getTeacher = getTeacher;
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_id } = req.body;
        if (department_id == null) {
            res.status(400).json({ success: false, message: 'department_id is required' });
            return;
        }
        const teacher = await teacherService.updateTeacher(Number(id), {
            departmentId: Number(department_id),
        });
        res.status(200).json({ success: true, data: teacher });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Unable to update teacher' });
    }
};
exports.updateTeacher = updateTeacher;
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        await teacherService.deleteTeacher(Number(id));
        res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message || 'Teacher not found' });
    }
};
exports.deleteTeacher = deleteTeacher;
