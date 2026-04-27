import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

@Entity('user_roles')
@Unique(['user', 'role'])
export class UserRoleEntity extends AppBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.userRoles, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => RoleEntity, (role) => role.userRoles, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;
}
