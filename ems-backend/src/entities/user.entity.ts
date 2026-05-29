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
  
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // hashed

  @Column({ name: "role_id" })
  roleId: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  refresh_token: string;

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
