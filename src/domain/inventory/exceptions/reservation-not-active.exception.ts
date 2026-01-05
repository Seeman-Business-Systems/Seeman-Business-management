import { BadRequestException } from '@nestjs/common';

export class ReservationNotActiveException extends BadRequestException {
  constructor(reservationId: number, currentStatus: string) {
    super(
      `Cannot modify reservation ${reservationId}. Only ACTIVE reservations can be modified (current status: ${currentStatus})`,
    );
  }
}
