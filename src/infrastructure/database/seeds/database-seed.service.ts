import { Injectable, OnModuleInit } from '@nestjs/common';
import { RoleSeed } from './role.seed';
import { BranchSeed } from './branch.seed';
import { StaffSeed } from './staff.seed';
import { WarehouseSeed } from './warehouse.seed';
import { BrandSeed } from './brand.seed';
import { CategorySeed } from './category.seed';
import { ProductSeed } from './product.seed';
import { ProductVariantSeed } from './product-variant.seed';
import { InventorySeed } from './inventory.seed';
import { StockReservationSeed } from './stock-reservation.seed';
import { CustomerSeed } from './customer.seed';

@Injectable()
class DatabaseSeedService implements OnModuleInit {
  constructor(
    private readonly roleSeed: RoleSeed,
    private readonly branchSeed: BranchSeed,
    private readonly staffSeed: StaffSeed,
    private readonly warehouseSeed: WarehouseSeed,
    private readonly brandSeed: BrandSeed,
    private readonly categorySeed: CategorySeed,
    private readonly productSeed: ProductSeed,
    private readonly productVariantSeed: ProductVariantSeed,
    private readonly inventorySeed: InventorySeed,
    private readonly stockReservationSeed: StockReservationSeed,
    private readonly customerSeed: CustomerSeed,
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
      await this.customerSeed.seed();
      await this.warehouseSeed.seed();
      await this.brandSeed.seed();
      await this.categorySeed.seed();
      await this.productSeed.seed();
      await this.productVariantSeed.seed();
      await this.inventorySeed.seed();
      await this.stockReservationSeed.seed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}

export default DatabaseSeedService