import { BadRequestException } from '@nestjs/common';

export class BatchCannotBeReceivedException extends BadRequestException {
  constructor(reason: string) {
    super(`Batch cannot be received: ${reason}`);
  }
}