import StockReservation from 'src/domain/inventory/stock-reservation';
import ReservationStatus from 'src/domain/inventory/reservation-status';

abstract class StockReservationRepository {
  abstract findById(id: number): Promise<StockReservation | null>;
  abstract findByOrderId(orderId: number): Promise<StockReservation[]>;
  abstract findByCustomerId(customerId: number): Promise<StockReservation[]>;
  abstract findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<StockReservation[]>;
  abstract findActiveReservations(): Promise<StockReservation[]>;
  abstract findExpiredReservations(): Promise<StockReservation[]>;
  abstract findByStatus(status: ReservationStatus): Promise<StockReservation[]>;
  abstract commit(reservation: StockReservation): Promise<StockReservation>;
  abstract delete(id: number): Promise<void>;
}

export default StockReservationRepository;