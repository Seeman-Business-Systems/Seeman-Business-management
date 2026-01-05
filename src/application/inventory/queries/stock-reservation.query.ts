import { Injectable } from '@nestjs/common';
import StockReservationRepository from 'src/infrastructure/database/repositories/inventory/stock-reservation.repository';
import StockReservation from 'src/domain/inventory/stock-reservation';
import ReservationStatus from 'src/domain/inventory/reservation-status';

@Injectable()
class StockReservationQuery {
  constructor(private reservations: StockReservationRepository) {}

  async findById(id: number): Promise<StockReservation | null> {
    return await this.reservations.findById(id);
  }

  async findByOrderId(orderId: number): Promise<StockReservation[]> {
    return await this.reservations.findByOrderId(orderId);
  }

  async findByCustomerId(customerId: number): Promise<StockReservation[]> {
    return await this.reservations.findByCustomerId(customerId);
  }

  async findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<StockReservation[]> {
    return await this.reservations.findByVariantAndWarehouse(
      variantId,
      warehouseId,
    );
  }

  async findActiveReservations(): Promise<StockReservation[]> {
    return await this.reservations.findActiveReservations();
  }

  async findExpiredReservations(): Promise<StockReservation[]> {
    return await this.reservations.findExpiredReservations();
  }

  async findByStatus(status: ReservationStatus): Promise<StockReservation[]> {
    return await this.reservations.findByStatus(status);
  }

  async getTotalReservedForVariant(
    variantId: number,
    warehouseId: number,
  ): Promise<number> {
    const reservations = await this.reservations.findByVariantAndWarehouse(
      variantId,
      warehouseId,
    );

    return reservations
      .filter((r) => r.isActive())
      .reduce((total, r) => total + r.getQuantity(), 0);
  }
}

export default StockReservationQuery;