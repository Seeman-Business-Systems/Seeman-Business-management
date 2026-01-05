import { BadRequestException } from '@nestjs/common';

export class InvalidReorderLevelsException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}