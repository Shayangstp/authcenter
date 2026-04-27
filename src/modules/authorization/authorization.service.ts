import { Injectable } from '@nestjs/common';
import { AccessEvaluationRequest } from 'src/common/interfaces/access-evaluation.interface';
import { AuthorizationEngineService } from '../policy-engine/authorization-engine.service';

@Injectable()
export class AuthorizationService {
  constructor(private readonly authorizationEngineService: AuthorizationEngineService) {}

  authorize(request: AccessEvaluationRequest) {
    return this.authorizationEngineService.evaluateAccess(request);
  }
}
