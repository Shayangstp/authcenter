import { Column, Entity, OneToMany } from 'typeorm';
import { AppBaseEntity } from './base.entity';
import { RolePermissionEntity } from './role-permission.entity';

@Entity('permissions')
export class PermissionEntity extends AppBaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column()
  service!: string;

  @Column()
  resource!: string;

  @Column()
  action!: string;

  @OneToMany(() => RolePermissionEntity, (rolePermission) => rolePermission.permission)
  rolePermissions!: RolePermissionEntity[];
}
