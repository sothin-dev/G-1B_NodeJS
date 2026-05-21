import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Course } from './course.entity';

@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id' })
  studentId: number;

  @Column({ name: 'course_id' })
  courseId: number;

  @Column({ type: 'float', nullable: true })
  assignment_score: number;

  @Column({ type: 'float', nullable: true })
  midterm_score: number;

  @Column({ type: 'float', nullable: true })
  final_score: number;

  @Column({ type: 'float', nullable: true })
  total_score: number;

  @Column({ type: 'char', length: 2, nullable: true })
  grade: string; // A, A-, B+, etc.

  @ManyToOne(() => Student, student => student.grades)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, course => course.grades)
  @JoinColumn({ name: 'course_id' })
  course: Course;
}