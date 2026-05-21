import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';
import { Course } from './course.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @Column({ name: 'department_id', nullable: true })
  departmentId: number;

  @OneToOne(() => User, user => user.teacher)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department, department => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Course, course => course.teacher)
  courses: Course[];
}