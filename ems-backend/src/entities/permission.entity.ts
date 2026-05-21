import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RolePermission } from './role_permission.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g., "create_course", "approve_enrollment"

  @Column()
  module: string; // e.g., "courses", "enrollments"

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[];
}