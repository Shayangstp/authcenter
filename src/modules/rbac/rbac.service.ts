import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRolesRepository: Repository<UserRoleEntity>,
  ) {}

  async hasPermission(userId: string, permission: string, service: string): Promise<boolean> {
    const roles = await this.userRolesRepository.find({
      where: { user: { id: userId }, role: { service } },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'],
    });

    return roles.some((entry) =>
      entry.role.rolePermissions.some((rolePermission) => rolePermission.permission.name === permission),
    );
  }

  async hasRole(userId: string, roleName: string, service: string): Promise<boolean> {
    const role = await this.userRolesRepository.findOne({
      where: { user: { id: userId }, role: { name: roleName, service } },
      relations: ['role'],
    });
    return Boolean(role);
  }
}
