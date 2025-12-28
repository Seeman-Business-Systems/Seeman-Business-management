import { Injectable } from '@nestjs/common';
import CategoryRepository from '../repositories/product/category.repository';
import Category from 'src/domain/product/category';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class CategorySeed {
  constructor(
    private readonly categories: CategoryRepository,
  ) {}

  async seed() {
    const existingCategories: Category[] = await this.categories.findAll();

    if (existingCategories.length > 0) {
      console.log('Categories already exist. Skipping seed.');
      return;
    }

    // Parent categories will be created first (IDs 1-3)
    // Then sub-categories will reference them
    const defaultCategories = [
      // Parent Categories
      {
        id: undefined,
        name: 'Tyres',
        description: 'All types of vehicle tyres',
        parentId: null,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Batteries',
        description: 'Automotive batteries for all vehicle types',
        parentId: null,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Spare Parts',
        description: 'General automotive spare parts and components',
        parentId: null,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Create parent categories first
    for (const categoryData of defaultCategories) {
      const category = new Category(
        categoryData.id,
        categoryData.name,
        categoryData.description,
        categoryData.parentId,
        categoryData.createdBy,
        categoryData.createdAt,
        categoryData.updatedAt,
      );
      await this.categories.commit(category);
    }

    // Sub-categories (assuming parent IDs 1, 2, 3 based on creation order)
    const subCategories = [
      // Tyre Sub-categories (parent ID: 1)
      {
        id: undefined,
        name: 'Car Tyres',
        description: 'Tyres for passenger cars and sedans',
        parentId: 1,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'SUV & 4x4 Tyres',
        description: 'Tyres for SUVs and off-road vehicles',
        parentId: 1,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Tricycle Tyres',
        description: 'Tyres for commercial tricycles (Keke NAPEP)',
        parentId: 1,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Agricultural Tyres',
        description: 'Tyres for tractors and agricultural machinery',
        parentId: 1,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Light Truck Tyres',
        description: 'Tyres for pickup trucks and light commercial vehicles',
        parentId: 1,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Battery Sub-categories (parent ID: 2)
      {
        id: undefined,
        name: 'Car Batteries',
        description: 'Standard batteries for passenger vehicles',
        parentId: 2,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Heavy Duty Batteries',
        description: 'High-capacity batteries for trucks and commercial vehicles',
        parentId: 2,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Motorcycle Batteries',
        description: 'Compact batteries for motorcycles and small vehicles',
        parentId: 2,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Spare Parts Sub-categories (parent ID: 3)
      {
        id: undefined,
        name: 'Suspension Parts',
        description: 'Shock absorbers, springs, and suspension components',
        parentId: 3,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Steering Parts',
        description: 'Tie rods, ball joints, and steering linkages',
        parentId: 3,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: undefined,
        name: 'Brake Parts',
        description: 'Brake pads, discs, and brake system components',
        parentId: 3,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const categoryData of subCategories) {
      const category = new Category(
        categoryData.id,
        categoryData.name,
        categoryData.description,
        categoryData.parentId,
        categoryData.createdBy,
        categoryData.createdAt,
        categoryData.updatedAt,
      );
      await this.categories.commit(category);
    }

    console.log('Default categories seeded successfully');
  }
}
