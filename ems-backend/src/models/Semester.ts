// src/models/Semester.ts
import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
} from 'typeorm'
import { Enrollment } from './Enrollment'

export type SemesterStatus = 'UPCOMING' | 'ACTIVE' | 'CLOSED'

@Entity('semesters')
export class Semester {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  year: number

  @Column({ type: 'enum', enum: ['UPCOMING', 'ACTIVE', 'CLOSED'], default: 'UPCOMING' })
  status: SemesterStatus

  @Column({ name: 'start_date', type: 'date' })
  startDate: string

  @Column({ name: 'end_date', type: 'date' })
  endDate: string

  @OneToMany(() => Enrollment, (enrollment) => enrollment.semester)
  enrollments: Enrollment[]
}