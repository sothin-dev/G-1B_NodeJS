import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Student } from './student.entity';
import { Semester } from './semester.entity';
import { EnrollmentCourse } from './enrollment-course.entity';

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('enrollments')
export class Enrollment extends BaseEntity {
  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'semester_id' })
  semesterId: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column()
  total_credits: number;

  @ManyToOne(() => Student, student => student.enrollments)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Semester, semester => semester.enrollments)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @OneToMany(() => EnrollmentCourse, ec => ec.enrollment)
  enrollmentCourses: EnrollmentCourse[];
}