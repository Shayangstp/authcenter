import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AclEntryEntity } from 'src/database/entities/acl-entry.entity';

@Injectable()
export class AclService {
  constructor(
    @InjectRepository(AclEntryEntity)
    private readonly aclEntriesRepository: Repository<AclEntryEntity>,
  ) {}

  async evaluate(userId: string, resourceType: string, resourceId?: string, permission?: string): Promise<boolean> {
    if (!resourceId || !permission) {
      return false;
    }

    const entry = await this.aclEntriesRepository.findOne({
      where: { userId, resourceType, resourceId, permission },
    });
    return Boolean(entry);
  }
}
