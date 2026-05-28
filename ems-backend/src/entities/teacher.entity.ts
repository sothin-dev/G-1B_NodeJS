import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Department } from './department.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('teachers')
export class Teacher extends BaseEntity {

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @OneToOne(() => User, user => user.teacher)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, department => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Course, course => course.teacher)
  courses: Course[];
}