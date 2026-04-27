import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const Jexl = require('jexl');
import { PolicyEntity } from 'src/database/entities/policy.entity';
import { CacheLayerService } from '../cache/cache.service';

@Injectable()
export class PbacService {
  constructor(
    @InjectRepository(PolicyEntity)
    private readonly policiesRepository: Repository<PolicyEntity>,
    private readonly cacheService: CacheLayerService,
  ) {}

  async evaluate(
    service: string,
    resource: string,
    action: string,
    input: Record<string, unknown>,
  ): Promise<boolean> {
    const cacheKey = `policies:${service}:${resource}:${action}`;
    let policies = await this.cacheService.get<PolicyEntity[]>(cacheKey);

    if (!policies) {
      policies = await this.policiesRepository.find({
        where: { service, resource, action },
        order: { priority: 'ASC' },
      });
      await this.cacheService.set(cacheKey, policies, 300);
    }

    for (const policy of policies) {
      const matched = await Jexl.eval(policy.condition, input);
      if (matched) {
        return policy.effect === 'ALLOW';
      }
    }

    return false;
  }
}
