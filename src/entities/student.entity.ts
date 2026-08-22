import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { BaseEntity } from "./baseEntity";
import { Department } from "./department.entity";
import { User } from "./user.entity";
import { Enrollment } from "./enrollment.entity";
import { Grade } from "./grade.entity";

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  GRADUATED = "GRADUATED",
  DROPPED = "DROPPED",
}

@Entity("students")
export class Student extends BaseEntity {
  @Column({ name: "student_number", unique: true, nullable: true })
  studentNumber: string;

  @Column({ type: "uuid", name: "department_id", nullable: true })
  departmentId: string;

  @Column({ type: "enum", enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ name: "enrollment_year", type: "int" })
  enrollmentYear: number;

  @Column({ name: "user_id", unique: true, nullable: true })
  userId: string;

  @ManyToOne(() => Department, (department) => department.students)
  @JoinColumn({ name: "department_id" })
  department: Department;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];
}
