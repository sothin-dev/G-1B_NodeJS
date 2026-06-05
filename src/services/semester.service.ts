import { AppDataSource } from "../config/database";
import { Semester, SemesterStatus } from "../entities/semester.entity";
import { Enrollment } from "../entities/enrollment.entity";
import semesterRepository from "../repository/semester.repository";
import { AppError } from "../core/errors/app-error";
import { CreateSemesterDto } from "../dto/createSemester.dto";
import { UpdateSemesterDto } from "../dto/updateSemester.dto";

class SemesterService {
  async listSemesters(status?: SemesterStatus, year?: number) {
    const query = AppDataSource.getRepository(Semester).createQueryBuilder("semester");

    if (status) {
      query.andWhere("semester.status = :status", { status });
    }

    if (year) {
      query.andWhere("semester.year = :year", { year });
    }

    return query.orderBy("semester.year", "DESC").addOrderBy("semester.start_date", "DESC").getMany();
  }

  async createSemester(data: CreateSemesterDto) {
    if (new Date(data.start_date) > new Date(data.end_date)) {
      throw new AppError("Semester start_date must be before end_date", 400);
    }

    const existing = await semesterRepository.findByNameAndYear(data.name, data.year);
    if (existing) {
      throw new AppError("Semester with the same name and year already exists", 409);
    }

    return semesterRepository.create({
      name: data.name,
      year: data.year,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      status: SemesterStatus.UPCOMING,
    });
  }

  async getSemester(id: string) {
    const semester = await AppDataSource.getRepository(Semester).findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError("Semester not found", 404);
    }

    return semester;
  }

  async updateSemester(id: string, data: UpdateSemesterDto) {
    const semester = await AppDataSource.getRepository(Semester).findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError("Semester not found", 404);
    }

    const updatedStartDate = data.start_date ? new Date(data.start_date) : semester.start_date;
    const updatedEndDate = data.end_date ? new Date(data.end_date) : semester.end_date;

    if (updatedStartDate > updatedEndDate) {
      throw new AppError("Semester start_date must be before end_date", 400);
    }

    if (data.name || data.year) {
      const name = data.name ?? semester.name;
      const year = data.year ?? semester.year;
      const existing = await semesterRepository.findByNameAndYear(name, year);
      if (existing && existing.id !== id) {
        throw new AppError("Semester with the same name and year already exists", 409);
      }
    }

    return semesterRepository.update(id, {
      ...data,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
    });
  }

  async deleteSemester(id: string) {
    const semester = await AppDataSource.getRepository(Semester).findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError("Semester not found", 404);
    }

    const enrollmentCount = await AppDataSource.getRepository(Enrollment).count({
      where: { semester: { id } as any },
    });

    if (enrollmentCount > 0) {
      throw new AppError("Cannot delete semester with existing enrollments", 400);
    }

    await semesterRepository.delete(id);
    return { message: "Semester deleted successfully" };
  }

  async openEnrollment(id: string) {
    const semesterRepo = AppDataSource.getRepository(Semester);
    const semester = await semesterRepo.findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError("Semester not found", 404);
    }

    if (semester.status === SemesterStatus.ACTIVE) {
      return semester;
    }

    await semesterRepo.update(
      { status: SemesterStatus.ACTIVE },
      { status: SemesterStatus.CLOSED },
    );

    semester.status = SemesterStatus.ACTIVE;
    return semesterRepo.save(semester);
  }

  async closeEnrollment(id: string) {
    const semesterRepo = AppDataSource.getRepository(Semester);
    const semester = await semesterRepo.findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError("Semester not found", 404);
    }

    if (semester.status !== SemesterStatus.ACTIVE) {
      throw new AppError("Semester is not active", 400);
    }

    semester.status = SemesterStatus.CLOSED;
    return semesterRepo.save(semester);
  }

  async getActiveSemester() {
    const semester = await AppDataSource.getRepository(Semester).findOne({
      where: { status: SemesterStatus.ACTIVE },
    });

    if (!semester) {
      throw new AppError("No active semester found", 404);
    }

    return semester;
  }
}

export default new SemesterService();
