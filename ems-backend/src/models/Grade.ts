// src/models/Grade.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn,
} from 'typeorm'
import { Student } from './Student'
import { Course } from './Course'

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'assignment_score', type: 'float', default: 0 })
  assignmentScore: number

  @Column({ name: 'midterm_score', type: 'float', default: 0 })
  midtermScore: number

  @Column({ name: 'final_score', type: 'float', default: 0 })
  finalScore: number

  @Column({ name: 'total_score', type: 'float', default: 0 })
  totalScore: number

  @Column({ nullable: true })
  grade: string   // A, B, C, D, F

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student

  @ManyToOne(() => Course, (course) => course.grades)
  @JoinColumn({ name: 'course_id' })
  course: Course
}