import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AclEntryEntity } from 'src/database/entities/acl-entry.entity';
import { PolicyEntity } from 'src/database/entities/policy.entity';
import { RelationshipEntity } from 'src/database/entities/relationship.entity';
import { ResourceAttributeEntity } from 'src/database/entities/resource-attribute.entity';
import { RolePermissionEntity } from 'src/database/entities/role-permission.entity';
import { UserAttributeEntity } from 'src/database/entities/user-attribute.entity';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';
import { CacheLayerModule } from '../cache/cache.module';
import { ServicesModule } from '../services/services.module';
import { AbacService } from '../abac/abac.service';
import { AclService } from '../acl/acl.service';
import { AuthorizationController } from './authorization.controller';
import { AuthorizationService } from './authorization.service';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionGuard } from '../guards/permission.guard';
import { PolicyGuard } from '../guards/policy.guard';
import { PbacService } from '../pbac/pbac.service';
import { AuthorizationEngineService } from '../policy-engine/authorization-engine.service';
import { RbacService } from '../rbac/rbac.service';
import { RebacService } from '../rebac/rebac.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserRoleEntity,
      RolePermissionEntity,
      UserAttributeEntity,
      ResourceAttributeEntity,
      PolicyEntity,
      AclEntryEntity,
      RelationshipEntity,
    ]),
    ServicesModule,
    CacheLayerModule,
  ],
  controllers: [AuthorizationController],
  providers: [
    AuthorizationService,
    AuthorizationEngineService,
    RbacService,
    AbacService,
    PbacService,
    AclService,
    RebacService,
    RolesGuard,
    PermissionGuard,
    PolicyGuard,
  ],
  exports: [AuthorizationEngineService, RbacService, RolesGuard, PermissionGuard, PolicyGuard],
})
export class AuthorizationModule {}
