import { NotFoundException } from '@nestjs/common';

export class BatchNotFoundException extends NotFoundException {
  constructor(batchId: number) {
    super(`Batch with id ${batchId} not found`);
  }
}