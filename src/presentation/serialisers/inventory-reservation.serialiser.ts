import { Injectable } from '@nestjs/common';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import ProductVariantRepository from 'src/infrastructure/database/repositories/product/product-variant.repository';
import WarehouseRepository from 'src/infrastructure/database/repositories/warehouse/warehouse.repository';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import ProductSerialiser from './product.serialiser';
import WarehouseSerialiser from './warehouse.serialiser';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class InventoryReservationSerialiser {
  constructor(
    private readonly variants: ProductVariantRepository,
    private readonly warehouses: WarehouseRepository,
    private readonly staff: StaffRepository,
    private readonly productSerialiser: ProductSerialiser,
    private readonly warehouseSerialiser: WarehouseSerialiser,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(
    reservation: InventoryReservation,
    includeRelations: boolean = true,
  ) {
    const result: any = {
      id: reservation.getId(),
      variantId: reservation.getVariantId(),
      warehouseId: reservation.getWarehouseId(),
      orderId: reservation.getOrderId(),
      customerId: reservation.getCustomerId(),
      quantity: reservation.getQuantity(),
      reservedBy: reservation.getReservedBy(),
      reservedAt: reservation.getReservedAt(),
      expiresAt: reservation.getExpiresAt(),
      status: reservation.getStatus(),
      notes: reservation.getNotes(),
      isActive: reservation.isActive(),
      isExpired: reservation.isExpired(),
      createdAt: reservation.getCreatedAt(),
      updatedAt: reservation.getUpdatedAt(),
    };

    if (includeRelations) {
      const variant = await this.variants.findById(reservation.getVariantId());
      const warehouse = await this.warehouses.findById(
        reservation.getWarehouseId(),
      );
      const reservedByStaff = await this.staff.findById(
        reservation.getReservedBy(),
      );

      result.variant = variant
        ? await this.productSerialiser.serialiseVariant(variant)
        : null;
      result.warehouse = warehouse
        ? await this.warehouseSerialiser.serialise(warehouse)
        : null;
      result.reservedByStaff = reservedByStaff
        ? this.staffSerialiser.serialise(reservedByStaff)
        : null;
    }

    return result;
  }

  async serialiseMany(
    reservations: InventoryReservation[],
    includeRelations: boolean = true,
  ) {
    return Promise.all(
      reservations.map((reservation) =>
        this.serialise(reservation, includeRelations),
      ),
    );
  }
}

export default InventoryReservationSerialiser;
