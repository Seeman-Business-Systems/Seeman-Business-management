import { Injectable, OnModuleInit } from '@nestjs/common';
import { RoleSeed } from './role.seed';
import { BranchSeed } from './branch.seed';
import { StaffSeed } from './staff.seed';
import { WarehouseSeed } from './warehouse.seed';

@Injectable()
class DatabaseSeedService implements OnModuleInit {
  constructor(
    private readonly roleSeed: RoleSeed,
    private readonly branchSeed: BranchSeed,
    private readonly staffSeed: StaffSeed,
    private readonly warehouseSeed: WarehouseSeed,
  ) {}

  async onModuleInit() {
    await this.seedDatabase();
  }

  private async seedDatabase() {
    try {
      console.log('Starting database seeding...');
      await this.roleSeed.seed();
      await this.branchSeed.seed();
      await this.staffSeed.seed();
      await this.warehouseSeed.seed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}

export default DatabaseSeedService