import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity('policies')
@Index(['service', 'resource', 'action'])
export class PolicyEntity extends AppBaseEntity {
  @Column()
  service!: string;

  @Column()
  resource!: string;

  @Column()
  action!: string;

  @Column()
  effect!: 'ALLOW' | 'DENY';

  @Column('text')
  condition!: string;

  @Column({ default: 100 })
  priority!: number;
}
