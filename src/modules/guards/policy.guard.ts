import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { PbacService } from '../pbac/pbac.service';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly pbacService: PbacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const service = request.headers['x-service-name']?.toString() ?? 'default';
    const resource = request.headers['x-resource-name']?.toString() ?? request.route.path;
    const action = request.method.toLowerCase();

    return this.pbacService.evaluate(service, resource, action, {
      user: request.user,
      resource: request.body,
      environment: { ip: request.ip },
    });
  }
}
