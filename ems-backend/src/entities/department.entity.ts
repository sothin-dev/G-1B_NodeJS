import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Course } from './course.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @OneToMany(() => Student, student => student.department)
  students: Student[];

  @OneToMany(() => Teacher, teacher => teacher.department)
  teachers: Teacher[];

  @OneToMany(() => Course, course => course.department)
  courses: Course[];
}