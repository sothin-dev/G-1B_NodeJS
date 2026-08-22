import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";

import { BaseEntity } from "./baseEntity";

import { Role } from "./role.entity";
import { ActivityLog } from "./activity-log.entity";
import { Teacher } from "./teacher.entity";
import { Student } from "./student.entity";

@Entity("users")
export class User extends BaseEntity {
  @Column({ name: "first_name" })
  firstName: string;

  @Column({ name: "last_name" })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed

  @Column({ name: "role_id" })
  roleId: string;

  @Column({ name: "is_active", default: true })
  isActive: boolean;

  @Column({
    name: "refresh_token",
    type: "text",
    nullable: true,
  })
  refreshToken: string;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @OneToMany(() => ActivityLog, (log) => log.user)
  activityLogs: ActivityLog[];

  @OneToOne(() => Teacher, (teacher) => teacher.user)
  teacher: Teacher;

  @OneToOne(() => Student, (student) => student.user)
  student: Student;
}
