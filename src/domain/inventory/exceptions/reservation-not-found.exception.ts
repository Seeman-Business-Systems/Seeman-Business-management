import { NotFoundException } from '@nestjs/common';

export class ReservationNotFoundException extends NotFoundException {
  constructor(reservationId: number) {
    super(`Reservation with id ${reservationId} not found`);
  }
}
