import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from 'src/common/decorators/require-permission.decorator';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { AuthorizationEngineService } from '../policy-engine/authorization-engine.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationEngineService: AuthorizationEngineService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [service, resource, action] = permission.split('.');
    const evaluation = await this.authorizationEngineService.evaluateAccess({
      userId: request.user.sub,
      service,
      resource,
      action,
      resourceId: Array.isArray(request.params.id) ? request.params.id[0] : request.params.id,
      context: {
        resource: request.body,
        environment: { ip: request.ip },
      },
    });
    return evaluation.allowed;
  }
}
