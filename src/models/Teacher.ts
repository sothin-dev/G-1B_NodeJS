// src/models/Teacher.ts
import {
  Entity, PrimaryGeneratedColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm'
import { User } from './User'
import { Department } from './Department'
import { Course } from './Course'

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User

  @ManyToOne(() => Department, (department) => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department

  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[]
}