import { BadRequestException } from '@nestjs/common';

export class BatchCannotBeDeletedException extends BadRequestException {
  constructor(reason: string) {
    super(`Batch cannot be deleted: ${reason}`);
  }
}