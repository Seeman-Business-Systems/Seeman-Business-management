import { BadRequestException } from '@nestjs/common';

export class InsufficientStockException extends BadRequestException {
  constructor(available: number, requested: number) {
    super(
      `Insufficient available stock. Available: ${available}, Requested: ${requested}`,
    );
  }
}