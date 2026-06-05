import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { User } from './user.entity';
import { RolePermission } from './role_permission.entity';

@Entity('roles')
export class Role extends BaseEntity {

  @Column({ unique: true })
  name: string; // SUPER_ADMIN, ADMIN, TEACHER, STUDENT

  @OneToMany(() => User, user => user.role)
  users: User[];

  @OneToMany(() => RolePermission, rp => rp.role)
  rolePermissions: RolePermission[];
}