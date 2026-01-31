import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import InventoryReservationEntity from '../../entities/inventory-reservation.entity';
import ReservationStatus from 'src/domain/inventory/reservation-status';

abstract class InventoryReservationRepository {
  abstract findById(id: number): Promise<InventoryReservation | null>;
  abstract findByOrderId(orderId: number): Promise<InventoryReservation[]>;
  abstract findByCustomerId(
    customerId: number,
  ): Promise<InventoryReservation[]>;
  abstract findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<InventoryReservation[]>;
  abstract findActiveReservations(): Promise<InventoryReservation[]>;
  abstract findExpiredReservations(): Promise<InventoryReservation[]>;
  abstract findByStatus(
    status: ReservationStatus,
  ): Promise<InventoryReservation[]>;
  abstract commit(
    reservation: InventoryReservation,
  ): Promise<InventoryReservation>;
  abstract delete(id: number): Promise<void>;
  abstract toDomain(entity: InventoryReservationEntity): InventoryReservation;
}

export default InventoryReservationRepository;
