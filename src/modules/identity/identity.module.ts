import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/database/entities/session.entity';
import { UserRoleEntity } from 'src/database/entities/user-role.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { CacheLayerModule } from '../cache/cache.module';
import { EventsModule } from '../events/events.module';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([UserEntity, SessionEntity, UserRoleEntity]),
    CacheLayerModule,
    EventsModule,
  ],
  controllers: [IdentityController],
  providers: [IdentityService, JwtStrategy, JwtAuthGuard],
  exports: [IdentityService, JwtAuthGuard],
})
export class IdentityModule {}
