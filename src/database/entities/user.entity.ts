import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { MembershipEntity } from './membership.entity';
import { SessionEntity } from './session.entity';
import { UserAttributeEntity } from './user-attribute.entity';
import { UserRoleEntity } from './user-role.entity';

@Entity('users')
export class UserEntity extends AppBaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled!: boolean;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp?: string;

  @OneToMany(() => MembershipEntity, (membership) => membership.user)
  memberships!: MembershipEntity[];

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles!: UserRoleEntity[];

  @OneToMany(() => UserAttributeEntity, (attribute) => attribute.user)
  attributes!: UserAttributeEntity[];

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions!: SessionEntity[];
}
