import { Test, TestingModule } from '@nestjs/testing';
import { AuthorizationService } from './authorization.service';
import { AuthorizationEngineService } from '../policy-engine/authorization-engine.service';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let engineService: AuthorizationEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorizationService,
        {
          provide: AuthorizationEngineService,
          useValue: {
            evaluateAccess: jest.fn().mockResolvedValue({
              allowed: true,
              reasons: ['RBAC:ALLOW'],
              evaluatedModels: ['RBAC'],
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthorizationService>(AuthorizationService);
    engineService = module.get<AuthorizationEngineService>(AuthorizationEngineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should authorize access', async () => {
    const result = await service.authorize({
      userId: 'user-123',
      service: 'test-service',
      resource: 'post',
      action: 'read',
    });

    expect(result.allowed).toBe(true);
    expect(result.evaluatedModels).toContain('RBAC');
    expect(engineService.evaluateAccess).toHaveBeenCalled();
  });
});
