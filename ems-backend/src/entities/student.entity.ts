import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';
import { Enrollment } from './enrollment.entity';
import { Grade } from './grade.entity';

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  GRADUATED = 'GRADUATED',
  DROPPED = 'DROPPED',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  student_number: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ type: 'int' })
  enrollment_year: number;

  @ManyToOne(() => Department, department => department.students)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToOne(() => User, user => user.student)
  @JoinColumn({ name: 'id' }) // shares same primary key as users
  user: User;

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Grade, grade => grade.student)
  grades: Grade[];
}