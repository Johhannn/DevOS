import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') || 'redis://localhost:6379';
        const redis = new Redis(redisUrl);
        return {
          throttlers: [{
            ttl: 3600000, 
            limit: 100,
          }],
          storage: new ThrottlerStorageRedisService(redisUrl),
        };
      },
    }),
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
