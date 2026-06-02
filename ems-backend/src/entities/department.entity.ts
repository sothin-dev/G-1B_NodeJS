import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Course } from './course.entity';

@Entity('departments')
export class Department extends BaseEntity {

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Student, student => student.department)
  students: Student[];

  @OneToMany(() => Teacher, teacher => teacher.department)
  teachers: Teacher[];

  @OneToMany(() => Course, course => course.department)
  courses: Course[];
}
