import { Injectable } from '@nestjs/common';
import BrandRepository from '../repositories/product/brand.repository';
import Brand from 'src/domain/product/brand';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class BrandSeed {
  constructor(
    private readonly brands: BrandRepository,
  ) {}

  async seed() {
    const existingBrands: Brand[] = await this.brands.findAll();

    if (existingBrands.length > 0) {
      console.log('Brands already exist. Skipping seed.');
      return;
    }

    const defaultBrands = [
      // Tyre Brands
      {
        id: undefined,
        name: 'Bridgestone',
        code: 'BRI',
        description: 'Premium Japanese tyre manufacturer known for quality and durability',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Presa',
        code: 'PRE',
        description: 'Budget-friendly tyre brand popular in African markets',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Maxxis',
        code: 'MAX',
        description: 'Taiwanese tyre brand offering excellent value for money',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Hifly',
        code: 'HIF',
        description: 'Chinese tyre manufacturer with competitive pricing',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Firestone',
        code: 'FIR',
        description: 'American tyre brand with strong performance heritage',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Michelin',
        code: 'MIC',
        description: 'French premium tyre manufacturer, industry leader',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Dunlop',
        code: 'DUN',
        description: 'British tyre brand with motorsport pedigree',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Austone',
        code: 'AUS',
        description: 'Value tyre brand suitable for various vehicle types',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Battery Brands
      {
        id: undefined,
        name: 'Seeman',
        code: 'SEE',
        description: 'Reliable automotive batteries for Nigerian conditions',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Varta',
        code: 'VAR',
        description: 'German premium battery manufacturer with advanced technology',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Bosch',
        code: 'BOS',
        description: 'High-performance batteries from trusted automotive supplier',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Solite',
        code: 'SOL',
        description: 'Korean battery brand known for longevity',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spare Parts Brands
      {
        id: undefined,
        name: 'Sachs',
        code: 'SAC',
        description: 'Premium shock absorber manufacturer from Germany',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Monroe',
        code: 'MON',
        description: 'Leading suspension and shock absorber brand',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'TRW',
        code: 'TRW',
        description: 'Comprehensive automotive parts manufacturer',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Lemforder',
        code: 'LEM',
        description: 'German manufacturer of steering and suspension components',
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const brandData of defaultBrands) {
      const brand = new Brand(
        brandData.id,
        brandData.name,
        brandData.code,
        brandData.description,
        brandData.createdBy,
        brandData.createdAt,
        brandData.updatedAt,
      );
      await this.brands.commit(brand);
    }

    console.log('✅ Default brands seeded successfully');
  }
}
