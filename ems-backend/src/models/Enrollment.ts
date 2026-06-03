// src/models/Enrollment.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn,
} from 'typeorm'
import { Student } from './Student'
import { Semester } from './Semester'
import { EnrollmentCourse } from './EnrollmentCourse'

export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: ['PENDING','APPROVED','REJECTED','CANCELLED'], default: 'PENDING' })
  status: EnrollmentStatus

  @Column({ name: 'total_credits', default: 0 })
  total_credits: number

  @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
  rejection_reason: string | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Student, (student) => student.enrollments)
  @JoinColumn({ name: 'student_id' })
  student: Student

  @ManyToOne(() => Semester, (semester) => semester.enrollments)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester

  @OneToMany(() => EnrollmentCourse, (ec) => ec.enrollment, { cascade: true })
  enrollmentCourses: EnrollmentCourse[]
}