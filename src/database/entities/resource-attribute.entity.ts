import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity('resource_attributes')
@Index(['service', 'resourceType', 'resourceId', 'key'])
export class ResourceAttributeEntity extends AppBaseEntity {
  @Column()
  service!: string;

  @Column({ name: 'resource_type' })
  resourceType!: string;

  @Column({ name: 'resource_id' })
  resourceId!: string;

  @Column()
  key!: string;

  @Column('jsonb')
  value!: unknown;
}
