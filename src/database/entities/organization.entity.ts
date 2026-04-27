import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { MembershipEntity } from './membership.entity';

@Entity('organizations')
export class OrganizationEntity extends AppBaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ name: 'tenant_key' })
  tenantKey!: string;

  @OneToMany(() => MembershipEntity, (membership) => membership.organization)
  memberships!: MembershipEntity[];
}
