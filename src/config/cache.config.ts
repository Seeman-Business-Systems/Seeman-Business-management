import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const CacheConfig = CacheModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const useRedis = configService.get('REDIS_ENABLED', 'false') === 'true';

    if (useRedis) {
      const store = await redisStore({
        socket: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
        ttl: 300000, // 5 minutes in milliseconds
      });
      console.log('Using Redis cache');
      return { store };
    }

    console.log('Using in-memory cache');
    return { ttl: 300000 };
  },
});