import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipEntity } from 'src/database/entities/membership.entity';
import { OrganizationEntity } from 'src/database/entities/organization.entity';
import { UserEntity } from 'src/database/entities/user.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(UserEntity) private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity) private readonly organizationsRepository: Repository<OrganizationEntity>,
    @InjectRepository(MembershipEntity) private readonly membershipsRepository: Repository<MembershipEntity>,
  ) {}

  findUserById(userId: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id: userId }, relations: ['attributes', 'userRoles', 'userRoles.role'] });
  }

  listOrganizations(): Promise<OrganizationEntity[]> {
    return this.organizationsRepository.find();
  }

  listMembershipsForUser(userId: string): Promise<MembershipEntity[]> {
    return this.membershipsRepository.find({ where: { user: { id: userId } } });
  }
}
