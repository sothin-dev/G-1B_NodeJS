import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Course } from './course.entity';

@Entity('schedules')
export class Schedule extends BaseEntity {
  @Column({ name: 'course_id' })
  courseId: string;

  @Column()
  day: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column()
  room: string;

  @ManyToOne(() => Course, course => course.schedules)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
