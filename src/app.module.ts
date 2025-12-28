import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import DatabaseSeedService from './infrastructure/database/seeds/database-seed.service';
import AuthService from './modules/auth/auth.service';
import { RefreshTokenModule } from './modules/tokens/refresh-token.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
    RefreshTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseSeedService, AuthService],
})
  
export class AppModule {}
