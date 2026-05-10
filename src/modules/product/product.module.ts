import { forwardRef, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import BrandEntity from 'src/infrastructure/database/entities/brand.entity';
import CategoryEntity from 'src/infrastructure/database/entities/category.entity';
import ProductEntity from 'src/infrastructure/database/entities/product.entity';
import ProductVariantEntity from 'src/infrastructure/database/entities/product-variant.entity';
import StaffEntity from 'src/infrastructure/database/entities/staff.entity';

// Repositories
import BrandRepository from 'src/infrastructure/database/repositories/product/brand.repository';
import BrandDBRepository from 'src/infrastructure/database/repositories/product/brand.db-repository';
import CategoryRepository from 'src/infrastructure/database/repositories/product/category.repository';
import CategoryDBRepository from 'src/infrastructure/database/repositories/product/category.db-repository';
import ProductRepository from 'src/infrastructure/database/repositories/product/product.repository';
import ProductDBRepository from 'src/infrastructure/database/repositories/product/product.db-repository';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import ProductVariantDBRepository from 'src/infrastructure/database/repositories/product/product-variant.db-repository';

// Controllers
import BrandController from 'src/presentation/http/controllers/brand.controller';
import CategoryController from 'src/presentation/http/controllers/category.controller';
import ProductController from 'src/presentation/http/controllers/product.controller';

// Serializers
import BrandSerialiser from 'src/presentation/serialisers/brand.serialiser';
import CategorySerialiser from 'src/presentation/serialisers/category.serialiser';
import ProductSerialiser from 'src/presentation/serialisers/product.serialiser';

// Command Handlers - Brand
import CreateBrandHandler from 'src/application/product/commands/brand/create/create-brand';
import UpdateBrandHandler from 'src/application/product/commands/brand/update/update-brand';
import DeleteBrandHandler from 'src/application/product/commands/brand/delete/delete-brand';

// Command Handlers - Category
import CreateCategoryHandler from 'src/application/product/commands/category/create/create-category';
import UpdateCategoryHandler from 'src/application/product/commands/category/update/update-category';
import DeleteCategoryHandler from 'src/application/product/commands/category/delete/delete-category';

// Command Handlers - Product
import CreateProductHandler from 'src/application/product/commands/product/create/create-product';
import UpdateProductHandler from 'src/application/product/commands/product/update/update-product';
import DeleteProductHandler from 'src/application/product/commands/product/delete/delete-product';

// Command Handlers - ProductVariant
import CreateProductVariantHandler from 'src/application/product/commands/product-variant/create/create-product-variant';
import UpdateProductVariantHandler from 'src/application/product/commands/product-variant/update/update-product-variant';
import DeleteProductVariantHandler from 'src/application/product/commands/product-variant/delete/delete-product-variant';

// Queries
import ProductQuery from 'src/application/product/queries/product.query';

// Modules
import { StaffModule } from '../staff/staff.module';
import { RoleModule } from '../role/role.module';
import { InventoryModule } from '../inventory/inventory.module';
import { WarehouseModule } from '../warehouse/warehouse.module';

// Seeds
import { BrandSeed } from 'src/infrastructure/database/seeds/brand.seed';
import { CategorySeed } from 'src/infrastructure/database/seeds/category.seed';
import { ProductSeed } from 'src/infrastructure/database/seeds/product.seed';
import { ProductVariantSeed } from 'src/infrastructure/database/seeds/product-variant.seed';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      BrandEntity,
      CategoryEntity,
      ProductEntity,
      ProductVariantEntity,
      StaffEntity,
    ]),
    StaffModule,
    RoleModule,
    forwardRef(() => InventoryModule),
    WarehouseModule,
  ],
  controllers: [
    BrandController,
    CategoryController,
    ProductController,
  ],
  providers: [
    // Repository bindings
    {
      provide: BrandRepository,
      useClass: BrandDBRepository,
    },
    {
      provide: CategoryRepository,
      useClass: CategoryDBRepository,
    },
    {
      provide: ProductRepository,
      useClass: ProductDBRepository,
    },
    {
      provide: ProductVariantRepository,
      useClass: ProductVariantDBRepository,
    },

    // Queries
    ProductQuery,

    // Serializers
    BrandSerialiser,
    CategorySerialiser,
    ProductSerialiser,

    // Brand Command Handlers
    CreateBrandHandler,
    UpdateBrandHandler,
    DeleteBrandHandler,

    // Category Command Handlers
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,

    // Product Command Handlers
    CreateProductHandler,
    UpdateProductHandler,
    DeleteProductHandler,

    // ProductVariant Command Handlers
    CreateProductVariantHandler,
    UpdateProductVariantHandler,
    DeleteProductVariantHandler,

    // Seeds
    BrandSeed,
    CategorySeed,
    ProductSeed,
    ProductVariantSeed,
  ],
  exports: [
    BrandRepository,
    CategoryRepository,
    ProductRepository,
    ProductVariantRepository,
    ProductSerialiser,
    BrandSeed,
    CategorySeed,
    ProductSeed,
    ProductVariantSeed,
  ],
})
export class ProductModule {}
