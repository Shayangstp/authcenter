import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AclEntryEntity } from './entities/acl-entry.entity';
import { MembershipEntity } from './entities/membership.entity';
import { OrganizationEntity } from './entities/organization.entity';
import { PermissionEntity } from './entities/permission.entity';
import { PolicyEntity } from './entities/policy.entity';
import { RelationshipEntity } from './entities/relationship.entity';
import { ResourceAttributeEntity } from './entities/resource-attribute.entity';
import { RolePermissionEntity } from './entities/role-permission.entity';
import { RoleEntity } from './entities/role.entity';
import { ServiceEntity } from './entities/service.entity';
import { SessionEntity } from './entities/session.entity';
import { UserAttributeEntity } from './entities/user-attribute.entity';
import { UserRoleEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 55432),
  username: process.env.DB_USERNAME ?? 'auth_center',
  password: process.env.DB_PASSWORD ?? 'auth_center',
  database: process.env.DB_NAME ?? 'auth_center',
  entities: [
    UserEntity,
    OrganizationEntity,
    MembershipEntity,
    RoleEntity,
    PermissionEntity,
    RolePermissionEntity,
    UserRoleEntity,
    ServiceEntity,
    PolicyEntity,
    RelationshipEntity,
    AclEntryEntity,
    UserAttributeEntity,
    ResourceAttributeEntity,
    SessionEntity,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

export default new DataSource(dataSourceOptions);
