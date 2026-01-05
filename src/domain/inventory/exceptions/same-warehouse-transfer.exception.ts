import { BadRequestException } from '@nestjs/common';

export class SameWarehouseTransferException extends BadRequestException {
  constructor() {
    super('Source and destination warehouses cannot be the same');
  }
}