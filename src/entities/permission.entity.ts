import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { RolePermission } from './role_permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {

  @Column()
  name: string; // e.g., "create_course", "approve_enrollment"

  @Column()
  module: string; // e.g., "courses", "enrollments"

  @OneToMany(() => RolePermission, rp => rp.permission)
  rolePermissions: RolePermission[];
}