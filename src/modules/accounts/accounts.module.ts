import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipEntity } from 'src/database/entities/membership.entity';
import { OrganizationEntity } from 'src/database/entities/organization.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { AccountsService } from './accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OrganizationEntity, MembershipEntity])],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
