import { Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity('role_permissions')
@Unique(['role', 'permission'])
export class RolePermissionEntity extends AppBaseEntity {
  @ManyToOne(() => RoleEntity, (role) => role.rolePermissions, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: RoleEntity;

  @ManyToOne(() => PermissionEntity, (permission) => permission.rolePermissions, { eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;
}
