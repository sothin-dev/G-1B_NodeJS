// src/models/Course.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm'
import { Department } from './Department'
import { Teacher } from './Teacher'
import { Schedule } from './Schedule'
import { EnrollmentCourse } from './EnrollmentCourse'
import { Grade } from './Grade'

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ unique: true })
  code: string

  @Column()
  credit: number

  @Column()
  capacity: number

  @ManyToOne(() => Department, (department) => department.courses)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @ManyToOne(() => Teacher, (teacher) => teacher.courses)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher

  @OneToMany(() => Schedule, (schedule) => schedule.course, { cascade: true })
  schedules: Schedule[]

  @OneToMany(() => EnrollmentCourse, (ec) => ec.course)
  enrollmentCourses: EnrollmentCourse[]

  @OneToMany(() => Grade, (grade) => grade.course)
  grades: Grade[]
}