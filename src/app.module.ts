import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import messagingConfig from './config/messaging.config';
import { dataSourceOptions } from './database/data-source';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthorizationModule } from './modules/authorization/authorization.module';
import { CacheLayerModule } from './modules/cache/cache.module';
import { EventsModule } from './modules/events/events.module';
import { IdentityModule } from './modules/identity/identity.module';
import { ServicesModule } from './modules/services/services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig, messagingConfig],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('app.throttleTtl', 60) * 1000,
            limit: configService.get<number>('app.throttleLimit', 30),
          },
        ],
      }),
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        privateKey: readFileSync(configService.get<string>('auth.privateKeyPath', './keys/jwt-private.pem')),
        publicKey: readFileSync(configService.get<string>('auth.publicKeyPath', './keys/jwt-public.pem')),
        signOptions: {
          algorithm: 'RS256',
          issuer: configService.get<string>('auth.issuer'),
          audience: configService.get<string>('auth.audience'),
          expiresIn: configService.get<number>('auth.accessTtl', 900),
        },
        verifyOptions: {
          algorithms: ['RS256'],
          issuer: configService.get<string>('auth.issuer'),
          audience: configService.get<string>('auth.audience'),
        },
      }),
    }),
    CacheLayerModule,
    EventsModule,
    IdentityModule,
    AccountsModule,
    ServicesModule,
    AuthorizationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
