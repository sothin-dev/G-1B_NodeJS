// src/models/EnrollmentCourse.ts
import {
  Entity, PrimaryGeneratedColumn,
  ManyToOne, JoinColumn,
} from 'typeorm'
import { Enrollment } from './Enrollment'
import { Course } from './Course'

@Entity('enrollment_courses')
export class EnrollmentCourse {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Enrollment, (enrollment) => enrollment.enrollmentCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment

  @ManyToOne(() => Course, (course) => course.enrollmentCourses)
  @JoinColumn({ name: 'course_id' })
  course: Course
}