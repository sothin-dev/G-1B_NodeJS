"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const permission_entity_1 = require("../../entities/permission.entity");
const role_permission_entity_1 = require("../../entities/role_permission.entity");
const department_entity_1 = require("../../entities/department.entity");
const teacher_entity_1 = require("../../entities/teacher.entity");
const student_entity_1 = require("../../entities/student.entity");
const semester_entity_1 = require("../../entities/semester.entity");
const course_entity_1 = require("../../entities/course.entity");
const schedule_entity_1 = require("../../entities/schedule.entity");
const bcrypt = __importStar(require("bcryptjs"));
async function seed() {
    await database_1.AppDataSource.initialize();
    const roleRepo = database_1.AppDataSource.getRepository(role_entity_1.Role);
    const permissionRepo = database_1.AppDataSource.getRepository(permission_entity_1.Permission);
    const userRepo = database_1.AppDataSource.getRepository(user_entity_1.User);
    const rolePermissionRepo = database_1.AppDataSource.getRepository(role_permission_entity_1.RolePermission);
    const departmentRepo = database_1.AppDataSource.getRepository(department_entity_1.Department);
    const teacherRepo = database_1.AppDataSource.getRepository(teacher_entity_1.Teacher);
    const studentRepo = database_1.AppDataSource.getRepository(student_entity_1.Student);
    const semesterRepo = database_1.AppDataSource.getRepository(semester_entity_1.Semester);
    const courseRepo = database_1.AppDataSource.getRepository(course_entity_1.Course);
    const scheduleRepo = database_1.AppDataSource.getRepository(schedule_entity_1.Schedule);
    try {
        /* 1. ROLES */
        const roleNames = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"];
        const roles = {};
        for (const name of roleNames) {
            let role = await roleRepo.findOne({ where: { name } });
            if (!role) {
                role = await roleRepo.save(roleRepo.create({ name }));
            }
            roles[name] = role;
        }
        /* 2. PERMISSIONS */
        const permissions = [
            // USERS
            { name: "create_user", module: "users", description: "Create system user accounts" },
            { name: "update_user", module: "users", description: "Update user accounts" },
            { name: "delete_user", module: "users", description: "Deactivate user accounts" },
            // STUDENTS
            { name: "create_student", module: "students", description: "Register new students" },
            { name: "update_student", module: "students", description: "Update student details" },
            { name: "delete_student", module: "students", description: "Suspend or drop students" },
            { name: "manage_students", module: "students", description: "Full student management" },
            // COURSES
            { name: "create_course", module: "courses", description: "Create course offerings" },
            { name: "update_course", module: "courses", description: "Update course details" },
            { name: "delete_course", module: "courses", description: "Delete course offerings" },
            // ENROLLMENTS
            { name: "approve_enrollment", module: "enrollments", description: "Approve enrollment requests" },
            { name: "reject_enrollment", module: "enrollments", description: "Reject enrollment requests" },
            // ROLES & PERMISSIONS
            { name: "manage_roles", module: "roles", description: "Manage system roles" },
            { name: "manage_permissions", module: "permissions", description: "Manage role permissions" },
            // GRADES
            { name: "manage_grades", module: "grades", description: "Upload and publish grades" },
        ];
        const savedPermissions = [];
        for (const p of permissions) {
            let existing = await permissionRepo.findOne({ where: { name: p.name } });
            if (!existing) {
                existing = await permissionRepo.save(permissionRepo.create(p));
            }
            savedPermissions.push(existing);
        }
        /* 3. ASSIGN PERMISSIONS */
        // Super Admin gets all
        for (const permission of savedPermissions) {
            const exists = await rolePermissionRepo.findOne({
                where: { role_id: roles.SUPER_ADMIN.id, permission_id: permission.id },
            });
            if (!exists) {
                await rolePermissionRepo.save(rolePermissionRepo.create({
                    role_id: roles.SUPER_ADMIN.id,
                    permission_id: permission.id,
                }));
            }
        }
        // Admin gets operational permissions
        for (const permission of savedPermissions) {
            const exists = await rolePermissionRepo.findOne({
                where: { role_id: roles.ADMIN.id, permission_id: permission.id },
            });
            if (!exists) {
                await rolePermissionRepo.save(rolePermissionRepo.create({
                    role_id: roles.ADMIN.id,
                    permission_id: permission.id,
                }));
            }
        }
        /* 4. DEPARTMENTS */
        const departmentsData = [
            { name: "Computer Science", code: "CS" },
            { name: "Information Technology", code: "IT" },
            { name: "Business Administration", code: "BA" },
            { name: "Electrical Engineering", code: "EE" },
        ];
        const departments = {};
        for (const d of departmentsData) {
            let dept = await departmentRepo.findOne({ where: { code: d.code } });
            if (!dept) {
                dept = await departmentRepo.save(departmentRepo.create(d));
            }
            departments[d.code] = dept;
        }
        /* 5. ACTIVE SEMESTER */
        let semester = await semesterRepo.findOne({ where: { status: semester_entity_1.SemesterStatus.ACTIVE } });
        if (!semester) {
            semester = await semesterRepo.save(semesterRepo.create({
                name: "Fall Semester",
                year: new Date().getFullYear(),
                startDate: new Date("2026-09-01"),
                endDate: new Date("2026-12-31"),
                status: semester_entity_1.SemesterStatus.ACTIVE,
            }));
        }
        /* 6. DEFAULT USERS */
        // Super Admin
        let adminUser = await userRepo.findOne({ where: { email: "admin@university.edu" } });
        if (!adminUser) {
            adminUser = await userRepo.save(userRepo.create({
                firstName: "Super",
                lastName: "Admin",
                email: "admin@university.edu",
                password: await bcrypt.hash("Admin123!", 10),
                roleId: roles.SUPER_ADMIN.id,
                role: roles.SUPER_ADMIN,
                isActive: true,
            }));
        }
        // Teacher
        let teacherUser = await userRepo.findOne({ where: { email: "teacher@university.edu" } });
        let teacherRecord = null;
        if (!teacherUser) {
            teacherUser = await userRepo.save(userRepo.create({
                firstName: "Dr. Sarah",
                lastName: "Jenkins",
                email: "teacher@university.edu",
                password: await bcrypt.hash("Teacher123!", 10),
                roleId: roles.TEACHER.id,
                role: roles.TEACHER,
                isActive: true,
            }));
            teacherRecord = await teacherRepo.save(teacherRepo.create({
                userId: teacherUser.id,
                departmentId: departments.CS.id,
                department: departments.CS,
            }));
        }
        else {
            teacherRecord = await teacherRepo.findOne({ where: { userId: teacherUser.id } });
        }
        // Student
        let studentUser = await userRepo.findOne({ where: { email: "student@university.edu" } });
        if (!studentUser) {
            studentUser = await userRepo.save(userRepo.create({
                firstName: "Alex",
                lastName: "Rivera",
                email: "student@university.edu",
                password: await bcrypt.hash("Student123!", 10),
                roleId: roles.STUDENT.id,
                role: roles.STUDENT,
                isActive: true,
            }));
            await studentRepo.save(studentRepo.create({
                userId: studentUser.id,
                departmentId: departments.CS.id,
                studentNumber: "STU-2026-001",
                status: student_entity_1.StudentStatus.ACTIVE,
                enrollmentYear: new Date().getFullYear(),
            }));
        }
        /* 7. SAMPLE COURSES & SCHEDULES */
        const sampleCourses = [
            { name: "Introduction to Computer Science", code: "CS101", credits: 3, capacity: 35, dept: departments.CS, schedules: [{ day: "Monday", startTime: "09:00", endTime: "10:30", room: "Hall A-101" }, { day: "Wednesday", startTime: "09:00", endTime: "10:30", room: "Hall A-101" }] },
            { name: "Data Structures and Algorithms", code: "CS201", credits: 4, capacity: 30, dept: departments.CS, schedules: [{ day: "Tuesday", startTime: "10:00", endTime: "11:30", room: "Lab B-204" }, { day: "Thursday", startTime: "10:00", endTime: "11:30", room: "Lab B-204" }] },
            { name: "Database Management Systems", code: "CS301", credits: 3, capacity: 30, dept: departments.CS, schedules: [{ day: "Monday", startTime: "13:00", endTime: "14:30", room: "Room C-302" }] },
            { name: "Modern Web Development", code: "IT210", credits: 3, capacity: 25, dept: departments.IT, schedules: [{ day: "Friday", startTime: "09:00", endTime: "12:00", room: "Tech Lab 1" }] },
            { name: "Principles of Management", code: "BA101", credits: 3, capacity: 40, dept: departments.BA, schedules: [{ day: "Tuesday", startTime: "14:00", endTime: "15:30", room: "Hall C-105" }] },
        ];
        for (const sc of sampleCourses) {
            let course = await courseRepo.findOne({ where: { code: sc.code } });
            if (!course) {
                course = await courseRepo.save(courseRepo.create({
                    name: sc.name,
                    code: sc.code,
                    credits: sc.credits,
                    capacity: sc.capacity,
                    departmentId: sc.dept?.id,
                    department: sc.dept,
                    teacherId: teacherRecord ? teacherRecord.id : undefined,
                    teacher: teacherRecord ? teacherRecord : undefined,
                }));
                for (const s of sc.schedules) {
                    await scheduleRepo.save(scheduleRepo.create({
                        courseId: course.id,
                        day: s.day,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        room: s.room,
                    }));
                }
            }
        }
        console.log("Seed completed successfully!");
    }
    catch (error) {
        console.error("Seed error:", error);
    }
    finally {
        await database_1.AppDataSource.destroy();
        process.exit(0);
    }
}
