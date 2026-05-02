import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './modules/auth/guards/role.guard';
import JwtAuthGuard from './modules/auth/guards/jwt-auth.guard';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheConfig } from './config/cache.config';
import { DatabaseConfig } from './config/database.config';
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
import { SaleModule } from './modules/sale/sale.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SupplyModule } from './modules/supply/supply.module';
import { ExpenseModule } from './modules/expense/expense.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PermissionModule } from './modules/permission/permission.module';
import { IssueReportModule } from './modules/issue-report/issue-report.module';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheConfig,
    DatabaseConfig,
    AuthModule,
    StaffModule,
    BranchModule,
    RoleModule,
    WarehouseModule,
    ProductModule,
    InventoryModule,
    RefreshTokenModule,
    CustomerModule,
    SaleModule,
    ActivityModule,
    SupplyModule,
    ExpenseModule,
    AnalyticsModule,
    PermissionModule,
    IssueReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseSeedService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useExisting: RoleGuard },
  ],
})

export class AppModule {}
