import { NotFoundException } from '@nestjs/common';

export class InventoryNotFoundException extends NotFoundException {
  constructor(variantId: number, warehouseId: number) {
    super(
      `No inventory found for variant ${variantId} in warehouse ${warehouseId}`,
    );
  }
}