import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Course } from './course.entity';

@Entity('schedules')
export class Schedule extends BaseEntity {
  @Column({ name: 'course_id' })
  courseId: string;

  @Column()
  day: string; // Monday, Tuesday, etc.

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column()
  room: string;

  @ManyToOne(() => Course, course => course.schedules)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}