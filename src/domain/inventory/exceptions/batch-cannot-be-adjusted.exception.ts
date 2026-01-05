import { BadRequestException } from '@nestjs/common';

export class BatchCannotBeAdjustedException extends BadRequestException {
  constructor(reason: string) {
    super(`Batch cannot be adjusted: ${reason}`);
  }
}