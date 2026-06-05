"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const semester_entity_1 = require("../entities/semester.entity");
const enrollment_entity_1 = require("../entities/enrollment.entity");
const semester_repository_1 = __importDefault(require("../repository/semester.repository"));
const app_error_1 = require("../core/errors/app-error");
class SemesterService {
    async listSemesters(status, year) {
        const query = database_1.AppDataSource.getRepository(semester_entity_1.Semester).createQueryBuilder("semester");
        if (status) {
            query.andWhere("semester.status = :status", { status });
        }
        if (year) {
            query.andWhere("semester.year = :year", { year });
        }
        return query.orderBy("semester.year", "DESC").addOrderBy("semester.start_date", "DESC").getMany();
    }
    async createSemester(data) {
        if (new Date(data.start_date) > new Date(data.end_date)) {
            throw new app_error_1.AppError("Semester start_date must be before end_date", 400);
        }
        const existing = await semester_repository_1.default.findByNameAndYear(data.name, data.year);
        if (existing) {
            throw new app_error_1.AppError("Semester with the same name and year already exists", 409);
        }
        return semester_repository_1.default.create({
            name: data.name,
            year: data.year,
            start_date: new Date(data.start_date),
            end_date: new Date(data.end_date),
            status: semester_entity_1.SemesterStatus.UPCOMING,
        });
    }
    async getSemester(id) {
        const semester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { id },
        });
        if (!semester) {
            throw new app_error_1.AppError("Semester not found", 404);
        }
        return semester;
    }
    async updateSemester(id, data) {
        const semester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { id },
        });
        if (!semester) {
            throw new app_error_1.AppError("Semester not found", 404);
        }
        const updatedStartDate = data.start_date ? new Date(data.start_date) : semester.start_date;
        const updatedEndDate = data.end_date ? new Date(data.end_date) : semester.end_date;
        if (updatedStartDate > updatedEndDate) {
            throw new app_error_1.AppError("Semester start_date must be before end_date", 400);
        }
        if (data.name || data.year) {
            const name = data.name ?? semester.name;
            const year = data.year ?? semester.year;
            const existing = await semester_repository_1.default.findByNameAndYear(name, year);
            if (existing && existing.id !== id) {
                throw new app_error_1.AppError("Semester with the same name and year already exists", 409);
            }
        }
        return semester_repository_1.default.update(id, {
            ...data,
            start_date: data.start_date ? new Date(data.start_date) : undefined,
            end_date: data.end_date ? new Date(data.end_date) : undefined,
        });
    }
    async deleteSemester(id) {
        const semester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { id },
        });
        if (!semester) {
            throw new app_error_1.AppError("Semester not found", 404);
        }
        const enrollmentCount = await database_1.AppDataSource.getRepository(enrollment_entity_1.Enrollment).count({
            where: { semester: { id } },
        });
        if (enrollmentCount > 0) {
            throw new app_error_1.AppError("Cannot delete semester with existing enrollments", 400);
        }
        await semester_repository_1.default.delete(id);
        return { message: "Semester deleted successfully" };
    }
    async openEnrollment(id) {
        const semesterRepo = database_1.AppDataSource.getRepository(semester_entity_1.Semester);
        const semester = await semesterRepo.findOne({
            where: { id },
        });
        if (!semester) {
            throw new app_error_1.AppError("Semester not found", 404);
        }
        if (semester.status === semester_entity_1.SemesterStatus.ACTIVE) {
            return semester;
        }
        await semesterRepo.update({ status: semester_entity_1.SemesterStatus.ACTIVE }, { status: semester_entity_1.SemesterStatus.CLOSED });
        semester.status = semester_entity_1.SemesterStatus.ACTIVE;
        return semesterRepo.save(semester);
    }
    async closeEnrollment(id) {
        const semesterRepo = database_1.AppDataSource.getRepository(semester_entity_1.Semester);
        const semester = await semesterRepo.findOne({
            where: { id },
        });
        if (!semester) {
            throw new app_error_1.AppError("Semester not found", 404);
        }
        if (semester.status !== semester_entity_1.SemesterStatus.ACTIVE) {
            throw new app_error_1.AppError("Semester is not active", 400);
        }
        semester.status = semester_entity_1.SemesterStatus.CLOSED;
        return semesterRepo.save(semester);
    }
    async getActiveSemester() {
        const semester = await database_1.AppDataSource.getRepository(semester_entity_1.Semester).findOne({
            where: { status: semester_entity_1.SemesterStatus.ACTIVE },
        });
        if (!semester) {
            throw new app_error_1.AppError("No active semester found", 404);
        }
        return semester;
    }
}
exports.default = new SemesterService();
