import { Injectable } from '@nestjs/common';
import ProductRepository from '../repositories/product/product.repository';
import Product from 'src/domain/product/product';
import ProductType from 'src/domain/product/product-type';
import ProductStatus from 'src/domain/product/product-status';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class ProductSeed {
  constructor(
    private readonly products: ProductRepository,
  ) {}

  async seed() {
    const existingProducts: Product[] = await this.products.findAll();

    if (existingProducts.length > 0) {
      console.log('Products already exist. Skipping seed.');
      return;
    }

    // Brand seeding order:
    // 1. Bridgestone, 2. Presa, 3. Maxxis, 4. Hifly, 5. Firestone,
    // 6. Michelin, 7. Dunlop, 8. Austone
    // 9. Seeman (battery), 10. Varta, 11. Bosch, 12. Solite
    // 13. Sachs, 14. Monroe, 15. TRW, 16. Lemforder

    // Category seeding order:
    // Parent: 1. Tyres, 2. Batteries, 3. Spare Parts
    // Sub-categories: 4. Car Tyres, 5. SUV & 4x4 Tyres, 6. Tricycle Tyres,
    // 7. Agricultural Tyres, 8. Light Truck Tyres
    // 9. Car Batteries, 10. Heavy Duty Batteries, 11. Motorcycle Batteries
    // 12. Suspension Parts, 13. Steering Parts, 14. Brake Parts

    const defaultProducts = [
      // TYRES - Car Tyres (Category 4)
      {
        id: undefined,
        name: 'Bridgestone Turanza T005',
        description: 'Premium touring tyre with excellent wet grip and comfort',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 1, // Bridgestone
        categoryId: 4, // Car Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Presa PS01',
        description: 'Economical tyre for city driving and daily commute',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 2, // Presa
        categoryId: 4, // Car Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Maxxis MA-P3',
        description: 'All-season passenger car tyre with great value',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 3, // Maxxis
        categoryId: 4, // Car Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Michelin Primacy 4',
        description: 'Premium safety tyre with exceptional longevity',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 6, // Michelin
        categoryId: 4, // Car Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // TYRES - SUV & 4x4 Tyres (Category 5)
      {
        id: undefined,
        name: 'Bridgestone Dueler H/T',
        description: 'Highway terrain tyre for SUVs and light trucks',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 1, // Bridgestone
        categoryId: 5, // SUV & 4x4 Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Maxxis AT-771 Bravo',
        description: 'All-terrain tyre for on and off-road performance',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 3, // Maxxis
        categoryId: 5, // SUV & 4x4 Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // TYRES - Tricycle Tyres (Category 6)
      {
        id: undefined,
        name: 'Austone Tricycle Tyre',
        description: 'Durable tyre designed for commercial tricycles',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 8, // Austone
        categoryId: 6, // Tricycle Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Hifly Keke NAPEP Tyre',
        description: 'Heavy-duty tricycle tyre for Nigerian roads',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 4, // Hifly
        categoryId: 6, // Tricycle Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // TYRES - Agricultural Tyres (Category 7)
      {
        id: undefined,
        name: 'Firestone Performer',
        description: 'Tractor tyre with superior traction in field conditions',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 5, // Firestone
        categoryId: 7, // Agricultural Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Dunlop Farm Pro',
        description: 'Multi-purpose agricultural tyre for various machinery',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 7, // Dunlop
        categoryId: 7, // Agricultural Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // TYRES - Light Truck Tyres (Category 8)
      {
        id: undefined,
        name: 'Bridgestone Duravis',
        description: 'Commercial van and light truck tyre',
        productType: ProductType.TYRE,
        status: ProductStatus.ACTIVE,
        brandId: 1, // Bridgestone
        categoryId: 8, // Light Truck Tyres
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // BATTERIES - Car Batteries (Category 9)
      {
        id: undefined,
        name: 'Seeman Standard',
        description: 'Reliable car battery for Nigerian climate conditions',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 9, // Seeman
        categoryId: 9, // Car Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Varta Blue Dynamic',
        description: 'High-performance battery with proven reliability',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 10, // Varta
        categoryId: 9, // Car Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Bosch S4',
        description: 'Premium car battery with advanced technology',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 11, // Bosch
        categoryId: 9, // Car Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Solite Silver',
        description: 'Long-lasting battery with excellent cold cranking power',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 12, // Solite
        categoryId: 9, // Car Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // BATTERIES - Heavy Duty Batteries (Category 10)
      {
        id: undefined,
        name: 'Seeman Heavy Duty',
        description: 'High-capacity battery for trucks and commercial vehicles',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 9, // Seeman
        categoryId: 10, // Heavy Duty Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Varta Promotive Black',
        description: 'Professional truck battery with extra power',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 10, // Varta
        categoryId: 10, // Heavy Duty Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // BATTERIES - Motorcycle Batteries (Category 11)
      {
        id: undefined,
        name: 'Solite Bike',
        description: 'Compact motorcycle battery with reliable starting power',
        productType: ProductType.BATTERY,
        status: ProductStatus.ACTIVE,
        brandId: 12, // Solite
        categoryId: 11, // Motorcycle Batteries
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // SPARE PARTS - Suspension Parts (Category 12)
      {
        id: undefined,
        name: 'Sachs Shock Absorber',
        description: 'Premium shock absorber for smooth and comfortable ride',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 13, // Sachs
        categoryId: 12, // Suspension Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Monroe OESpectrum',
        description: 'Original equipment quality shock absorber',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 14, // Monroe
        categoryId: 12, // Suspension Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // SPARE PARTS - Steering Parts (Category 13)
      {
        id: undefined,
        name: 'TRW Tie Rod End',
        description: 'High-quality steering linkage component',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 15, // TRW
        categoryId: 13, // Steering Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Lemforder Ball Joint',
        description: 'Precision-engineered ball joint for optimal steering',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 16, // Lemforder
        categoryId: 13, // Steering Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'TRW Steering Rack End',
        description: 'Durable rack end for precise steering control',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 15, // TRW
        categoryId: 13, // Steering Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // SPARE PARTS - Brake Parts (Category 14)
      {
        id: undefined,
        name: 'TRW Brake Pad',
        description: 'Premium brake pads for reliable stopping power',
        productType: ProductType.SPARE_PART,
        status: ProductStatus.ACTIVE,
        brandId: 15, // TRW
        categoryId: 14, // Brake Parts
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const productData of defaultProducts) {
      const product = new Product(
        productData.id,
        productData.name,
        productData.description,
        productData.productType,
        productData.status,
        productData.brandId,
        productData.categoryId,
        productData.createdBy,
        productData.createdAt,
        productData.updatedAt,
      );
      await this.products.commit(product);
    }

    console.log('Default products seeded successfully');
  }
}
