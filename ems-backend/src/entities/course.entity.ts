import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Department } from './department.entity';
import { Teacher } from './teacher.entity';
import { Schedule } from './schedule.entity';
import { EnrollmentCourse } from './enrollment-course.entity';
import { Grade } from './grade.entity';

@Entity('courses')
export class Course extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  credit: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @Column({ name: 'teacher_id', nullable: true })
  teacherId: string;

  @Column()
  capacity: number;

  @ManyToOne(() => Department, department => department.courses)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Teacher, teacher => teacher.courses)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @OneToMany(() => Schedule, schedule => schedule.course)
  schedules: Schedule[];

  @OneToMany(() => EnrollmentCourse, ec => ec.course)
  enrollmentCourses: EnrollmentCourse[];

  @OneToMany(() => Grade, grade => grade.course)
  grades: Grade[];
}