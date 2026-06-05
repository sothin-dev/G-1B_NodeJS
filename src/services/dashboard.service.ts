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
    const enrollmentCount = await AppDataSource.getRepository(Enrollment).count();

    const activeSemester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    const topCourses = await AppDataSource.getRepository(Course)
      .createQueryBuilder("course")
      .leftJoin("course.enrollmentCourses", "enrollmentCourse")
      .leftJoin("enrollmentCourse.enrollment", "enrollment")
      .leftJoin("enrollment.semester", "semester")
      .where("semester.status = :status", { status: SemesterStatus.ACTIVE })
      .select(["course.id", "course.name", "course.code", "COUNT(enrollmentCourse.id) AS enrollmentCount"])
      .groupBy("course.id")
      .orderBy("enrollmentCount", "DESC")
      .limit(5)
      .getRawMany();

    return {
      studentCount,
      enrollmentCount,
      activeSemester,
      topCourses: topCourses.map((item) => ({
        id: item.course_id,
        name: item.course_name,
        code: item.course_code,
        enrollmentCount: Number(item.enrollmentCount),
      })),
    };
  }

  async getStudentDashboard(userId: string) {
    const user = await AppDataSource.getRepository(User).findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const student = await AppDataSource.getRepository(Student).findOne({
      where: { user: { id: userId } as any },
      relations: ["department", "enrollments", "enrollments.enrollmentCourses", "enrollments.enrollmentCourses.course"],
    });

    if (!student) {
      throw new AppError("Student profile not found", 404);
    }

    const latestGrades = await AppDataSource.getRepository(Grade).find({
      where: { student: { id: student.id } as any },
      relations: ["course"],
      order: { created_at: "DESC" },
      take: 5,
    });

    const pendingEnrollments = await AppDataSource.getRepository(Enrollment).find({
      where: { student: { id: student.id } as any },
    });

    const credits = student.enrollments.reduce((sum, enrollment) => sum + (enrollment.total_credits ?? 0), 0);

    return {
      student: {
        id: student.id,
        studentNumber: student.student_number,
        department: student.department?.name ?? null,
        status: student.status,
      },
      credits,
      courses: student.enrollments.flatMap((enrollment) =>
        enrollment.enrollmentCourses.map((entry) => ({
          id: entry.course?.id,
          name: entry.course?.name,
          code: entry.course?.code,
          credit: entry.course?.credit,
          semesterId: enrollment.semesterId,
        })),
      ),
      pendingStatus: pendingEnrollments.filter((enrollment) => enrollment.status === "PENDING").length,
      latestGrades,
    };
  }

  async getTeacherDashboard(userId: string) {
    const teacher = await AppDataSource.getRepository(Teacher).findOne({
      where: { user: { id: userId } as any },
      relations: ["department", "courses"],
    });

    if (!teacher) {
      throw new AppError("Teacher profile not found", 404);
    }

    const assignedCourses = await AppDataSource.getRepository(Course).find({
      where: { teacher: { id: teacher.id } as any },
      relations: ["enrollmentCourses", "enrollmentCourses.enrollment"],
    });

    const studentCount = assignedCourses.reduce(
      (total, course) => total + (course.enrollmentCourses?.length ?? 0),
      0,
    );

    const gradeUploadStatus = assignedCourses.length > 0
      ? { uploaded: true, totalCourses: assignedCourses.length }
      : { uploaded: false, totalCourses: 0 };

    return {
      teacher: {
        id: teacher.id,
        department: teacher.department?.name ?? null,
      },
      assignedCourses,
      studentCount,
      gradeUploadStatus,
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
        "COUNT(DISTINCT enrollmentCourse.id) AS enrollmentCount",
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
        "COUNT(enrollmentCourse.id) AS enrollmentCount",
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
