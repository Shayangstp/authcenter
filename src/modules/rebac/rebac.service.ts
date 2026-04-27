import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelationshipEntity } from 'src/database/entities/relationship.entity';

@Injectable()
export class RebacService {
  constructor(
    @InjectRepository(RelationshipEntity)
    private readonly relationshipsRepository: Repository<RelationshipEntity>,
  ) {}

  async evaluate(userId: string, resourceType: string, resourceId?: string): Promise<boolean> {
    if (!resourceId) {
      return false;
    }

    const direct = await this.relationshipsRepository.findOne({
      where: {
        subjectType: 'user',
        subjectId: userId,
        objectType: resourceType,
        objectId: resourceId,
      },
    });
    if (direct) {
      return true;
    }

    const viaOrg = await this.relationshipsRepository
      .createQueryBuilder('relationship')
      .innerJoin(
        RelationshipEntity,
        'nextRelationship',
        'relationship.object_type = :orgType AND relationship.object_id = nextRelationship.subject_id',
        { orgType: 'org' },
      )
      .where('relationship.subject_type = :userType', { userType: 'user' })
      .andWhere('relationship.subject_id = :userId', { userId })
      .andWhere('nextRelationship.object_type = :resourceType', { resourceType })
      .andWhere('nextRelationship.object_id = :resourceId', { resourceId })
      .getOne();

    return Boolean(viaOrg);
  }
}
