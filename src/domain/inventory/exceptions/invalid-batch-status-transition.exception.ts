import { BadRequestException } from '@nestjs/common';

export class InvalidBatchStatusTransitionException extends BadRequestException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      `Invalid status transition from ${currentStatus} to ${targetStatus}`,
    );
  }
}