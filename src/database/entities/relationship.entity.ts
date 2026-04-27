import { Column, Entity, Index } from 'typeorm';
import { AppBaseEntity } from './base.entity';

@Entity('relationships')
@Index(['subjectType', 'subjectId', 'relation', 'objectType', 'objectId'])
export class RelationshipEntity extends AppBaseEntity {
  @Column({ name: 'subject_type' })
  subjectType!: string;

  @Column({ name: 'subject_id' })
  subjectId!: string;

  @Column()
  relation!: string;

  @Column({ name: 'object_type' })
  objectType!: string;

  @Column({ name: 'object_id' })
  objectId!: string;
}
