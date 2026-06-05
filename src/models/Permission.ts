// src/models/Permission.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { RolePermission } from './RolePermission'

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  module: string

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[]
}