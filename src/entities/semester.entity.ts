import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Enrollment } from './enrollment.entity';

export enum SemesterStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

@Entity('semesters')
export class Semester extends BaseEntity {
  @Column()
  name: string;

  @Column()
  year: number;

  @Column({ type: 'enum', enum: SemesterStatus, default: SemesterStatus.UPCOMING })
  status: SemesterStatus;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @OneToMany(() => Enrollment, enrollment => enrollment.semester)
  enrollments: Enrollment[];
}
