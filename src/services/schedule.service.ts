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
      startTime: data.start_time,
      endTime: data.end_time,
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
    schedule.startTime = data.start_time;
    schedule.endTime = data.end_time;
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
      const startTime = data.start_time ?? schedule.startTime;
      const endTime = data.end_time ?? schedule.endTime;
      const room = data.room ?? schedule.room;

      const conflictCheck = await scheduleRepository.checkConflict({
        day,
        startTime,
        endTime,
        room,
        excludeScheduleId: id,
      });

      if (conflictCheck.hasConflict) {
        throw new AppError(
          `Schedule conflict: Room ${room} is already booked on ${day} during this time slot`,
          409,
        );
      }

      schedule.day = day;
      schedule.startTime = startTime;
      schedule.endTime = endTime;
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
    const result = await scheduleRepository.checkConflict({
      day: data.day,
      startTime: data.start_time,
      endTime: data.end_time,
      room: data.room,
    });

    return {
      hasConflict: result.hasConflict,
      message: result.hasConflict
        ? `Conflict found: ${result.conflicts.length} existing schedule(s) overlap`
        : "No conflicts",
      conflicts: result.conflicts.map((c) => ({
        id: c.id,
        day: c.day,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        courseId: c.courseId,
      })),
    };
  }
}

export default new ScheduleService();
