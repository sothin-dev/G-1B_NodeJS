import { AppDataSource } from "../config/database";
import { BaseRepository } from "./base.repository";
import { Schedule } from "../entities/schedule.entity";

class ScheduleRepository extends BaseRepository<Schedule> {
  constructor() {
    super(AppDataSource.getRepository(Schedule));
  }

  async listSchedules(filters: {
    courseId?: string;
    day?: string;
    room?: string;
  }) {
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

    qb.orderBy("schedule.day", "ASC").addOrderBy("schedule.startTime", "ASC");

    return qb.getMany();
  }

  async findWithRelations(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ["course"],
    });
  }

  async checkConflict(data: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
    excludeScheduleId?: string;
  }) {
    let qb = this.repo
      .createQueryBuilder("schedule")
      .where("schedule.day = :day", { day: data.day })
      .andWhere("schedule.room = :room", { room: data.room });

    if (data.excludeScheduleId) {
      qb = qb.andWhere("schedule.id != :id", { id: data.excludeScheduleId });
    }

    const conflicts = await qb.getMany();

    const hasConflict = conflicts.some((existing) => {
      const existingStart = this.timeToMinutes(existing.startTime);
      const existingEnd = this.timeToMinutes(existing.endTime);
      const newStart = this.timeToMinutes(data.startTime);
      const newEnd = this.timeToMinutes(data.endTime);

      return (
        (newStart < existingEnd && newEnd > existingStart)
      );
    });

    return {
      hasConflict,
      conflicts: hasConflict ? conflicts : [],
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  async saveSchedule(schedule: Schedule) {
    return this.repo.save(schedule);
  }
}

export default new ScheduleRepository();
