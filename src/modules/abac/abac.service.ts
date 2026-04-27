import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
const Jexl = require('jexl');
import { ResourceAttributeEntity } from 'src/database/entities/resource-attribute.entity';
import { UserAttributeEntity } from 'src/database/entities/user-attribute.entity';

@Injectable()
export class AbacService {
  constructor(
    @InjectRepository(UserAttributeEntity)
    private readonly userAttributesRepository: Repository<UserAttributeEntity>,
    @InjectRepository(ResourceAttributeEntity)
    private readonly resourceAttributesRepository: Repository<ResourceAttributeEntity>,
  ) {}

  async evaluate(
    userId: string,
    service: string,
    resourceType: string,
    resourceId: string | undefined,
    rules: string[],
    context: Record<string, unknown> = {},
  ): Promise<boolean> {
    const userAttributes = await this.userAttributesRepository.find({ where: { user: { id: userId } } });
    const resourceAttributes = resourceId
      ? await this.resourceAttributesRepository.find({ where: { service, resourceType, resourceId } })
      : [];

    const user = Object.fromEntries(userAttributes.map((attribute) => [attribute.key, attribute.value]));
    const resource = Object.fromEntries(resourceAttributes.map((attribute) => [attribute.key, attribute.value]));

    for (const rule of rules) {
      const granted = await Jexl.eval(rule, { user: { id: userId, ...user }, resource, environment: context });
      if (granted) {
        return true;
      }
    }

    return false;
  }
}
