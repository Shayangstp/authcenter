import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from 'src/common/decorators/require-role.decorator';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { RbacService } from '../rbac/rbac.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly rbacService: RbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<string>(ROLE_KEY, context.getHandler());
    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const service = request.headers['x-service-name']?.toString() ?? 'default';
    return this.rbacService.hasRole(request.user.sub, requiredRole, service);
  }
}
