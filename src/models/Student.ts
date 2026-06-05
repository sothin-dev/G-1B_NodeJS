// src/models/Student.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm'
import { Department } from './Department'
import { Enrollment } from './Enrollment'

export type StudentStatus = 'ACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED'

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'student_number', unique: true })
  studentNumber: string

  @Column({ name: 'first_name' })
  firstName: string

  @Column({ name: 'last_name' })
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ type: 'enum', enum: ['ACTIVE', 'SUSPENDED', 'GRADUATED', 'DROPPED'], default: 'ACTIVE' })
  status: StudentStatus

  @ManyToOne(() => Department, (department) => department.students)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[]
}