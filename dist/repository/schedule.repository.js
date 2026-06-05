"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const base_repository_1 = require("./base.repository");
const schedule_entity_1 = require("../entities/schedule.entity");
class ScheduleRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(database_1.AppDataSource.getRepository(schedule_entity_1.Schedule));
    }
    async listSchedules(filters) {
        const qb = this.repo
            .createQueryBuilder("schedule")
            .leftJoinAndSelect("schedule.course", "course");
        if (filters.courseId) {
            qb.andWhere("schedule.courseId = :courseId", { courseId: filters.courseId });
        }
        if (filters.day) {
            qb.andWhere("schedule.day = :day", { day: filters.day });
        }
        if (filters.room) {
            qb.andWhere("schedule.room = :room", { room: filters.room });
        }
        qb.orderBy("schedule.day", "ASC").addOrderBy("schedule.start_time", "ASC");
        return qb.getMany();
    }
    async findWithRelations(id) {
        return this.repo.findOne({
            where: { id },
            relations: ["course"],
        });
    }
    async checkConflict(data) {
        let qb = this.repo
            .createQueryBuilder("schedule")
            .where("schedule.day = :day", { day: data.day })
            .andWhere("schedule.room = :room", { room: data.room });
        if (data.excludeScheduleId) {
            qb = qb.andWhere("schedule.id != :id", { id: data.excludeScheduleId });
        }
        const conflicts = await qb.getMany();
        const hasConflict = conflicts.some((existing) => {
            const existingStart = this.timeToMinutes(existing.start_time);
            const existingEnd = this.timeToMinutes(existing.end_time);
            const newStart = this.timeToMinutes(data.start_time);
            const newEnd = this.timeToMinutes(data.end_time);
            return ((newStart < existingEnd && newEnd > existingStart));
        });
        return {
            hasConflict,
            conflicts: hasConflict ? conflicts : [],
        };
    }
    timeToMinutes(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }
    async saveSchedule(schedule) {
        return this.repo.save(schedule);
    }
}
exports.default = new ScheduleRepository();
