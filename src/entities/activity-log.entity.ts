import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './baseEntity';
import { User } from './user.entity';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  action: string; // e.g., "USER_REGISTERED", "ENROLLMENT_APPROVED"

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @ManyToOne(() => User, user => user.activityLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}