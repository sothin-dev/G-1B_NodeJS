// src/models/Schedule.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm'
import { Course } from './Course'

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] })
  day: DayOfWeek

  @Column({ name: 'start_time', type: 'time' })
  start_time: string

  @Column({ name: 'end_time', type: 'time' })
  end_time: string

  @Column()
  room: string

  @ManyToOne(() => Course, (course) => course.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course
}