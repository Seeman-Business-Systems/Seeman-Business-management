import { BadRequestException } from '@nestjs/common';

export class BatchCannotBeTransferredException extends BadRequestException {
  constructor(reason: string) {
    super(`Batch cannot be transferred: ${reason}`);
  }
}