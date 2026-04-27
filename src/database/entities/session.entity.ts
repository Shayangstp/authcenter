import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('sessions')
@Index(['refreshTokenId'])
export class SessionEntity extends AppBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.sessions, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ name: 'refresh_token_id', unique: true })
  refreshTokenId!: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ default: false })
  revoked!: boolean;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;
}
