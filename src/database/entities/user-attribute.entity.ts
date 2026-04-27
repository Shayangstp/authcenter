import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity('user_attributes')
@Unique(['user', 'key'])
export class UserAttributeEntity extends AppBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.attributes, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column()
  key!: string;

  @Column('jsonb')
  value!: unknown;
}
