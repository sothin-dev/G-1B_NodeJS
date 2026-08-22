import { AppDataSource } from "../../config/database";
import { User } from "../../entities/user.entity";
import { Role } from "../../entities/role.entity";
import { Permission } from "../../entities/permission.entity";
import { RolePermission } from "../../entities/role_permission.entity";
import { Department } from "../../entities/department.entity";
import { Teacher } from "../../entities/teacher.entity";
import { Student, StudentStatus } from "../../entities/student.entity";
import { Semester, SemesterStatus } from "../../entities/semester.entity";
import { Course } from "../../entities/course.entity";
import { Schedule } from "../../entities/schedule.entity";
import * as bcrypt from "bcryptjs";

async function seed() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);
  const permissionRepo = AppDataSource.getRepository(Permission);
  const userRepo = AppDataSource.getRepository(User);
  const rolePermissionRepo = AppDataSource.getRepository(RolePermission);
  const departmentRepo = AppDataSource.getRepository(Department);
  const teacherRepo = AppDataSource.getRepository(Teacher);
  const studentRepo = AppDataSource.getRepository(Student);
  const semesterRepo = AppDataSource.getRepository(Semester);
  const courseRepo = AppDataSource.getRepository(Course);
  const scheduleRepo = AppDataSource.getRepository(Schedule);

  try {
    /* 1. ROLES */
    const roleNames = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"];
    const roles: Record<string, Role> = {};

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

    const savedPermissions: Permission[] = [];
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
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            role_id: roles.SUPER_ADMIN.id,
            permission_id: permission.id,
          })
        );
      }
    }

    // Admin gets operational permissions
    for (const permission of savedPermissions) {
      const exists = await rolePermissionRepo.findOne({
        where: { role_id: roles.ADMIN.id, permission_id: permission.id },
      });
      if (!exists) {
        await rolePermissionRepo.save(
          rolePermissionRepo.create({
            role_id: roles.ADMIN.id,
            permission_id: permission.id,
          })
        );
      }
    }

    /* 4. DEPARTMENTS */
    const departmentsData = [
      { name: "Computer Science", code: "CS" },
      { name: "Information Technology", code: "IT" },
      { name: "Business Administration", code: "BA" },
      { name: "Electrical Engineering", code: "EE" },
    ];

    const departments: Record<string, Department> = {};
    for (const d of departmentsData) {
      let dept = await departmentRepo.findOne({ where: { code: d.code } });
      if (!dept) {
        dept = await departmentRepo.save(departmentRepo.create(d));
      }
      departments[d.code] = dept;
    }

    /* 5. ACTIVE SEMESTER */
    let semester = await semesterRepo.findOne({ where: { status: SemesterStatus.ACTIVE } });
    if (!semester) {
      semester = await semesterRepo.save(
        semesterRepo.create({
          name: "Fall Semester",
          year: new Date().getFullYear(),
          startDate: new Date("2026-09-01"),
          endDate: new Date("2026-12-31"),
          status: SemesterStatus.ACTIVE,
        })
      );
    }

    /* 6. DEFAULT USERS */
    // Super Admin
    let adminUser = await userRepo.findOne({ where: { email: "admin@university.edu" } });
    if (!adminUser) {
      adminUser = await userRepo.save(
        userRepo.create({
          firstName: "Super",
          lastName: "Admin",
          email: "admin@university.edu",
          password: await bcrypt.hash("Admin123!", 10),
          roleId: roles.SUPER_ADMIN.id,
          role: roles.SUPER_ADMIN,
          isActive: true,
        })
      );
    }

    // Teacher
    let teacherUser = await userRepo.findOne({ where: { email: "teacher@university.edu" } });
    let teacherRecord: Teacher | null = null;
    if (!teacherUser) {
      teacherUser = await userRepo.save(
        userRepo.create({
          firstName: "Dr. Sarah",
          lastName: "Jenkins",
          email: "teacher@university.edu",
          password: await bcrypt.hash("Teacher123!", 10),
          roleId: roles.TEACHER.id,
          role: roles.TEACHER,
          isActive: true,
        })
      );
      teacherRecord = await teacherRepo.save(
        teacherRepo.create({
          userId: teacherUser.id,
          departmentId: departments.CS.id,
          department: departments.CS,
        })
      );
    } else {
      teacherRecord = await teacherRepo.findOne({ where: { userId: teacherUser.id } });
    }

    // Student
    let studentUser = await userRepo.findOne({ where: { email: "student@university.edu" } });
    if (!studentUser) {
      studentUser = await userRepo.save(
        userRepo.create({
          firstName: "Alex",
          lastName: "Rivera",
          email: "student@university.edu",
          password: await bcrypt.hash("Student123!", 10),
          roleId: roles.STUDENT.id,
          role: roles.STUDENT,
          isActive: true,
        })
      );
      await studentRepo.save(
        studentRepo.create({
          userId: studentUser.id,
          departmentId: departments.CS.id,
          studentNumber: "STU-2026-001",
          status: StudentStatus.ACTIVE,
          enrollmentYear: new Date().getFullYear(),
        })
      );
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
        course = await courseRepo.save(
          courseRepo.create({
            name: sc.name,
            code: sc.code,
            credits: sc.credits,
            capacity: sc.capacity,
            departmentId: sc.dept?.id,
            department: sc.dept,
            teacherId: teacherRecord ? teacherRecord.id : undefined,
            teacher: teacherRecord ? teacherRecord : undefined,
          })
        );

        for (const s of sc.schedules) {
          await scheduleRepo.save(
            scheduleRepo.create({
              courseId: course.id,
              day: s.day,
              startTime: s.startTime,
              endTime: s.endTime,
              room: s.room,
            })
          );
        }
      }
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}