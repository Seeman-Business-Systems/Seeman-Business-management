import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './modules/auth/auth.module';
import { StaffModule } from './modules/staff/staff.module';
import { BranchModule } from './modules/branch/branch.module';
import { RoleModule } from './modules/role/role.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { ProductModule } from './modules/product/product.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import DatabaseSeedService from './infrastructure/database/seeds/database-seed.service';
import { RefreshTokenModule } from './modules/tokens/refresh-token.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
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
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: true,
      autoLoadEntities: true,
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true, // Note: Set to false in production and use migrations
    }),
    AuthModule,
    StaffModule,
    BranchModule,
    RoleModule,
    WarehouseModule,
    ProductModule,
    InventoryModule,
    RefreshTokenModule,
    CustomerModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeedService],
})
  
export class AppModule {}
