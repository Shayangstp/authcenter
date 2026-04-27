import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { UserEntity } from './user.entity';

@Entity('memberships')
export class MembershipEntity extends AppBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.memberships, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.memberships, { eager: true })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;

  @Column()
  role!: string;
}
