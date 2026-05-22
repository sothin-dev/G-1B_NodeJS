// src/models/ActivityLog.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm'
import { User } from './User'

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  action: string

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => User, (user) => user.activityLogs)
  @JoinColumn({ name: 'user_id' })
  user: User
}