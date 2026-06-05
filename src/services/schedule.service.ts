import scheduleRepository from "../repository/schedule.repository";
import courseRepository from "../repository/course.repository";
import { CreateScheduleDto } from "../dto/createSchedule.dto";
import { UpdateScheduleDto } from "../dto/updateSchedule.dto";
import { AppError } from "../core/errors/app-error";
import { Schedule } from "../entities/schedule.entity";

class ScheduleService {
  async listSchedules(filters: {
    courseId?: string;
    day?: string;
    room?: string;
  }) {
    return scheduleRepository.listSchedules(filters);
  }

  async getScheduleDetails(id: string) {
    const schedule = await scheduleRepository.findWithRelations(id);

    if (!schedule) {
      throw new AppError("Schedule not found", 404);
    }

    return schedule;
  }

  async createSchedule(data: CreateScheduleDto) {
    const course = await courseRepository.findById(data.course_id);

    if (!course) {
      throw new AppError("Course not found", 404);
    }

    const conflictCheck = await scheduleRepository.checkConflict({
      day: data.day,
      start_time: data.start_time,
      end_time: data.end_time,
      room: data.room,
    });

    if (conflictCheck.hasConflict) {
      throw new AppError(
        `Schedule conflict: Room ${data.room} is already booked on ${data.day} during this time slot`,
        409,
      );
    }

    const schedule = new Schedule();
    schedule.courseId = data.course_id;
    schedule.day = data.day;
    schedule.start_time = data.start_time;
    schedule.end_time = data.end_time;
    schedule.room = data.room;

    return scheduleRepository.saveSchedule(schedule);
  }

  async updateSchedule(id: string, data: UpdateScheduleDto) {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
      throw new AppError("Schedule not found", 404);
    }

    if (
      data.day !== undefined ||
      data.start_time !== undefined ||
      data.end_time !== undefined ||
      data.room !== undefined
    ) {
      const day = data.day ?? schedule.day;
      const start_time = data.start_time ?? schedule.start_time;
      const end_time = data.end_time ?? schedule.end_time;
      const room = data.room ?? schedule.room;

      const conflictCheck = await scheduleRepository.checkConflict(
        {
          day,
          start_time,
          end_time,
          room,
          excludeScheduleId: id,
        },
      );

      if (conflictCheck.hasConflict) {
        throw new AppError(
          `Schedule conflict: Room ${room} is already booked on ${day} during this time slot`,
          409,
        );
      }

      schedule.day = day;
      schedule.start_time = start_time;
      schedule.end_time = end_time;
      schedule.room = room;
    }

    return scheduleRepository.saveSchedule(schedule);
  }

  async deleteSchedule(id: string) {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
      throw new AppError("Schedule not found", 404);
    }

    await scheduleRepository.delete(id);

    return { message: "Schedule deleted successfully" };
  }

  async checkConflict(data: {
    day: string;
    start_time: string;
    end_time: string;
    room: string;
  }) {
    const result = await scheduleRepository.checkConflict(data);

    return {
      hasConflict: result.hasConflict,
      message: result.hasConflict
        ? `Conflict found: ${result.conflicts.length} existing schedule(s) overlap`
        : "No conflicts",
      conflicts: result.conflicts.map((c) => ({
        id: c.id,
        day: c.day,
        start_time: c.start_time,
        end_time: c.end_time,
        room: c.room,
        courseId: c.courseId,
      })),
    };
  }
}

export default new ScheduleService();
