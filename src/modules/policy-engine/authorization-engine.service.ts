import { Injectable } from '@nestjs/common';
import {
  AccessEvaluationRequest,
  AccessEvaluationResult,
} from 'src/common/interfaces/access-evaluation.interface';
import { ServicesService } from '../services/services.service';
import { AbacService } from '../abac/abac.service';
import { AclService } from '../acl/acl.service';
import { PbacService } from '../pbac/pbac.service';
import { RbacService } from '../rbac/rbac.service';
import { RebacService } from '../rebac/rebac.service';

@Injectable()
export class AuthorizationEngineService {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly rbacService: RbacService,
    private readonly abacService: AbacService,
    private readonly pbacService: PbacService,
    private readonly aclService: AclService,
    private readonly rebacService: RebacService,
  ) {}

  async evaluateAccess(request: AccessEvaluationRequest): Promise<AccessEvaluationResult> {
    const serviceConfig = await this.servicesService.findByName(request.service);
    const permission = `${request.service}.${request.resource}.${request.action}`;
    const reasons: string[] = [];
    const evaluatedModels: string[] = [];

    for (const model of serviceConfig.enabledModels) {
      switch (model) {
        case 'RBAC': {
          evaluatedModels.push(model);
          const allowed = await this.rbacService.hasPermission(request.userId, permission, request.service);
          reasons.push(`RBAC:${allowed ? 'ALLOW' : 'MISS'}`);
          if (allowed) {
            return { allowed: true, reasons, evaluatedModels };
          }
          break;
        }
        case 'ABAC': {
          evaluatedModels.push(model);
          const rules = Array.isArray(request.context?.abacRules)
            ? (request.context?.abacRules as string[])
            : ['user.id == resource.ownerId'];
          const allowed = await this.abacService.evaluate(
            request.userId,
            request.service,
            request.resource,
            request.resourceId,
            rules,
            request.context,
          );
          reasons.push(`ABAC:${allowed ? 'ALLOW' : 'MISS'}`);
          if (allowed) {
            return { allowed: true, reasons, evaluatedModels };
          }
          break;
        }
        case 'PBAC': {
          evaluatedModels.push(model);
          const allowed = await this.pbacService.evaluate(request.service, request.resource, request.action, {
            user: { id: request.userId, ...(request.context?.user as object) },
            resource: request.context?.resource ?? {},
            environment: request.context?.environment ?? {},
          });
          reasons.push(`PBAC:${allowed ? 'ALLOW' : 'MISS'}`);
          if (allowed) {
            return { allowed: true, reasons, evaluatedModels };
          }
          break;
        }
        case 'ACL': {
          evaluatedModels.push(model);
          const allowed = await this.aclService.evaluate(request.userId, request.resource, request.resourceId, permission);
          reasons.push(`ACL:${allowed ? 'ALLOW' : 'MISS'}`);
          if (allowed) {
            return { allowed: true, reasons, evaluatedModels };
          }
          break;
        }
        case 'ReBAC': {
          evaluatedModels.push(model);
          const allowed = await this.rebacService.evaluate(request.userId, request.resource, request.resourceId);
          reasons.push(`ReBAC:${allowed ? 'ALLOW' : 'MISS'}`);
          if (allowed) {
            return { allowed: true, reasons, evaluatedModels };
          }
          break;
        }
        default:
          break;
      }
    }

    return { allowed: false, reasons, evaluatedModels };
  }
}
