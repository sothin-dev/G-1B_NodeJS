import { AppDataSource } from "../config/database";
import { AppError } from "../core/errors/app-error";
import { Course } from "../entities/course.entity";
import { Department } from "../entities/department.entity";
import { Enrollment } from "../entities/enrollment.entity";
import { Grade } from "../entities/grade.entity";
import { Semester, SemesterStatus } from "../entities/semester.entity";
import { Student } from "../entities/student.entity";
import { Teacher } from "../entities/teacher.entity";
import { User } from "../entities/user.entity";

class DashboardService {
  async getAdminOverview() {
    const studentCount = await AppDataSource.getRepository(Student).count();
    const teacherCount = await AppDataSource.getRepository(Teacher).count();
    const courseCount = await AppDataSource.getRepository(Course).count();
    const departmentCount = await AppDataSource.getRepository(Department).count();
    const enrollmentCount = await AppDataSource.getRepository(Enrollment).count();
    const pendingEnrollmentsCount = await AppDataSource.getRepository(Enrollment).count({
      where: { status: "PENDING" as any },
    });

    const activeSemester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    let topCourses: any[] = [];
    try {
      topCourses = await AppDataSource.getRepository(Course)
        .createQueryBuilder("course")
        .leftJoin("course.enrollmentCourses", "enrollmentCourse")
        .leftJoin("enrollmentCourse.enrollment", "enrollment")
        .leftJoin("enrollment.semester", "semester")
        .select([
          "course.id AS id",
          "course.name AS name",
          "course.code AS code",
          "course.capacity AS capacity",
          "COUNT(enrollmentCourse.course_id) AS enrollmentCount",
        ])
        .groupBy("course.id")
        .orderBy("enrollmentCount", "DESC")
        .limit(5)
        .getRawMany();
    } catch (e) {
      console.error("Top courses query failed:", e);
    }

    return {
      studentCount,
      teacherCount,
      courseCount,
      departmentCount,
      enrollmentCount,
      pendingEnrollmentsCount,
      activeSemester,
      topCourses: (topCourses || []).map((item) => ({
        id: item.id || item.course_id,
        name: item.name || item.course_name,
        code: item.code || item.course_code,
        capacity: Number(item.capacity || 30),
        enrollmentCount: Number(item.enrollmentCount || 0),
      })),
    };
  }

  async getStudentDashboard(userId: string) {
    const student = await AppDataSource.getRepository(Student).findOne({
      where: [
        { user: { id: userId } as any },
        { userId: userId },
        { id: userId },
      ],
      relations: [
        "user",
        "department",
        "enrollments",
        "enrollments.semester",
        "enrollments.enrollmentCourses",
        "enrollments.enrollmentCourses.course",
        "enrollments.enrollmentCourses.course.teacher",
        "enrollments.enrollmentCourses.course.teacher.user",
        "enrollments.enrollmentCourses.course.schedules",
        "enrollments.enrollmentCourses.course.department",
      ],
    });

    if (!student) {
      throw new AppError("Student profile not found", 404);
    }

    const latestGrades = await AppDataSource.getRepository(Grade).find({
      where: { student: { id: student.id } as any },
      relations: ["course"],
      order: { created_at: "DESC" },
      take: 10,
    });

    const pendingEnrollments = await AppDataSource.getRepository(Enrollment).find({
      where: { student: { id: student.id } as any, status: "PENDING" as any },
    });

    const approvedEnrollments = (student.enrollments || []).filter(e => e.status === "APPROVED" || e.status === "PENDING");
    const credits = approvedEnrollments.reduce((sum, enrollment) => sum + (enrollment.totalCredits ?? 0), 0);

    const activeSemester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    const coursesMap = new Map<string, any>();
    for (const enrollment of student.enrollments || []) {
      for (const entry of enrollment.enrollmentCourses || []) {
        if (entry.course && !coursesMap.has(entry.course.id)) {
          coursesMap.set(entry.course.id, {
            id: entry.course.id,
            name: entry.course.name,
            code: entry.course.code,
            credits: entry.course.credits,
            capacity: entry.course.capacity,
            semesterId: enrollment.semesterId,
            semesterName: enrollment.semester?.name,
            enrollmentStatus: enrollment.status,
            department: entry.course.department?.name,
            teacher: entry.course.teacher?.user ? `${entry.course.teacher.user.firstName} ${entry.course.teacher.user.lastName}` : null,
            schedules: entry.course.schedules || [],
          });
        }
      }
    }

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        department: student.department?.name ?? null,
        status: student.status,
        name: student.user ? `${student.user.firstName} ${student.user.lastName}` : student.studentNumber,
        email: student.user?.email,
      },
      credits,
      creditsCount: credits,
      courses: Array.from(coursesMap.values()),
      pendingStatus: pendingEnrollments.length,
      pendingApprovalsCount: pendingEnrollments.length,
      latestGrades,
      activeSemester,
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await AppDataSource.getRepository(Teacher).findOne({
      where: [
        { user: { id: userId } as any },
        { userId: userId },
        { id: userId },
      ],
      relations: ["user", "department", "courses"],
    });

    if (!teacher) {
      throw new AppError("Teacher profile not found", 404);
    }

    const assignedCourses = await AppDataSource.getRepository(Course).find({
      where: { teacher: { id: teacher.id } as any },
      relations: [
        "department",
        "schedules",
        "enrollmentCourses",
        "enrollmentCourses.enrollment",
        "enrollmentCourses.enrollment.student",
        "enrollmentCourses.enrollment.student.user",
        "grades",
      ],
    });

    const activeSemester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    const formattedCourses = assignedCourses.map(course => {
      const enrolledStudents = (course.enrollmentCourses || [])
        .filter(ec => ec.enrollment && ec.enrollment.status === 'APPROVED')
        .map(ec => ec.enrollment?.student)
        .filter(Boolean);

      const gradedCount = (course.grades || []).filter(g => g.isPublished).length;

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        credits: course.credits,
        capacity: course.capacity,
        department: course.department?.name,
        schedules: course.schedules || [],
        enrolledCount: enrolledStudents.length,
        gradedCount,
        pendingGradesCount: Math.max(0, enrolledStudents.length - gradedCount),
      };
    });

    const totalStudentsCount = formattedCourses.reduce(
      (total, c) => total + c.enrolledCount,
      0,
    );

    return {
      teacher: {
        id: teacher.id,
        name: teacher.user ? `${teacher.user.firstName} ${teacher.user.lastName}` : 'Faculty',
        email: teacher.user?.email,
        department: teacher.department?.name ?? null,
      },
      assignedCourses: formattedCourses,
      assignedCoursesCount: formattedCourses.length,
      studentCount: totalStudentsCount,
      totalStudentsCount,
      activeSemester,
    };
  }

  async getEnrollmentTrend() {
    const rows = await AppDataSource.getRepository(Enrollment)
      .createQueryBuilder("enrollment")
      .leftJoin("enrollment.semester", "semester")
      .select([
        "semester.name AS semesterName",
        "semester.year AS year",
        "COUNT(enrollment.id) AS totalEnrollments",
      ])
      .groupBy("semester.id")
      .orderBy("semester.year", "ASC")
      .getRawMany();

    return rows.map((row) => ({
      semester: row.semesterName,
      year: Number(row.year),
      totalEnrollments: Number(row.totalEnrollments),
    }));
  }

  async getDepartmentStats() {
    const rows = await AppDataSource.getRepository(Department)
      .createQueryBuilder("department")
      .leftJoin("department.students", "student")
      .leftJoin("department.courses", "course")
      .leftJoin("course.enrollmentCourses", "enrollmentCourse")
      .select([
        "department.id AS id",
        "department.name AS name",
        "department.code AS code",
        "COUNT(DISTINCT student.id) AS studentCount",
        "COUNT(DISTINCT enrollmentCourse.course_id) AS enrollmentCount",
      ])
      .groupBy("department.id")
      .orderBy("studentCount", "DESC")
      .getRawMany();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      studentCount: Number(row.studentCount),
      enrollmentCount: Number(row.enrollmentCount),
    }));
  }

  async getTopCoursesForActiveSemester() {
    const activeSemester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    if (!activeSemester) {
      return [];
    }

    const rows = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .leftJoin("course.enrollmentCourses", "enrollmentCourse")
      .leftJoin("enrollmentCourse.enrollment", "enrollment")
      .leftJoin("enrollment.semester", "semester")
      .where("semester.id = :semesterId", { semesterId: activeSemester.id })
      .select([
        "course.id AS id",
        "course.name AS name",
        "course.code AS code",
        "COUNT(enrollmentCourse.course_id) AS enrollmentCount",
      ])
      .groupBy("course.id")
      .orderBy("enrollmentCount", "DESC")
      .limit(10)
      .getRawMany();

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      enrollmentCount: Number(row.enrollmentCount),
    }));
  }
}

export default new DashboardService();
