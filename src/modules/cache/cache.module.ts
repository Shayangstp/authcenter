import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheLayerService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CacheLayerService],
  exports: [CacheLayerService],
})
export class CacheLayerModule {}
