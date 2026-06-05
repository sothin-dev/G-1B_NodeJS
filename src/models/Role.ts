// src/models/Role.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { User } from './User'
import { RolePermission } from './RolePermission'

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @OneToMany(() => User, (user) => user.role)
  users: User[]

  @OneToMany(() => RolePermission, (rp) => rp.role)
  rolePermissions: RolePermission[]
}