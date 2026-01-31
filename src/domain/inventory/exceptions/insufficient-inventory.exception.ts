import { BadRequestException } from '@nestjs/common';

export class InsufficientInventoryException extends BadRequestException {
  constructor(available: number, requested: number) {
    super(
      `Insufficient available inventory. Available: ${available}, Requested: ${requested}`,
    );
  }
}
