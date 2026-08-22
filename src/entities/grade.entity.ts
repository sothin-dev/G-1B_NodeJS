import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Student } from './student.entity';
import { Course } from './course.entity';

@Entity('grades')
export class Grade extends BaseEntity {
  @Column({ name: 'student_id' })
  studentId: string;

  @Column({ name: 'course_id' })
  courseId: string;

  @Column({ name: 'assignment_score', type: 'float', nullable: true })
  assignmentScore: number;

  @Column({ name: 'midterm_score', type: 'float', nullable: true })
  midtermScore: number;

  @Column({ name: 'final_score', type: 'float', nullable: true })
  finalScore: number;

  @Column({ name: 'total_score', type: 'float', nullable: true })
  totalScore: number;

  @Column({ name: 'grade', type: 'char', length: 2, nullable: true })
  letterGrade: string;

  @Column({ name: 'is_published', default: false })
  isPublished: boolean;

  @ManyToOne(() => Student, student => student.grades)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, course => course.grades)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}
