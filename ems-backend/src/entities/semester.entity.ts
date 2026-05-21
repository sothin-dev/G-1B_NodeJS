import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Enrollment } from './enrollment.entity';

export enum SemesterStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('semesters')
export class Semester {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., "Fall 2025"

  @Column()
  year: number;

  @Column({ type: 'enum', enum: SemesterStatus, default: SemesterStatus.UPCOMING })
  status: SemesterStatus;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @OneToMany(() => Enrollment, enrollment => enrollment.semester)
  enrollments: Enrollment[];
}