import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity('acl_entries')
@Index(['resourceType', 'resourceId', 'userId', 'permission'])
export class AclEntryEntity extends AppBaseEntity {
  @Column({ name: 'resource_type' })
  resourceType!: string;

  @Column({ name: 'resource_id' })
  resourceId!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column()
  permission!: string;
}
