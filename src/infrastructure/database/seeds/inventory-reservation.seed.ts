import { Injectable } from '@nestjs/common';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import InventoryRepository from 'src/infrastructure/database/repositories/inventory/inventory.repository';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import ReservationStatus from 'src/domain/inventory/reservation-status';

@Injectable()
export class InventoryReservationSeed {
  constructor(
    private reservations: InventoryReservationRepository,
    private inventories: InventoryRepository,
  ) {}

  async seed() {
    const existingReservations =
      await this.reservations.findActiveReservations();

    if (existingReservations.length > 0) {
      console.log('Inventory reservations already exist. Skipping seed.');
      return;
    }

    console.log('Seeding inventory reservations...');

    // Get some inventory records to create reservations for
    const inventory1 = await this.inventories.findByVariantAndWarehouse(1, 1); // Bridgestone 195/65 R15 at Onitsha Central
    const inventory2 = await this.inventories.findByVariantAndWarehouse(5, 2); // Bridgestone 215/55 R17 at Lagos Mainland
    const inventory3 = await this.inventories.findByVariantAndWarehouse(10, 1); // Michelin at Onitsha Central

    const reservationsData = [
      {
        variantId: 1,
        warehouseId: 1,
        orderId: null, // No order yet - just a quote
        customerId: null,
        quantity: 4,
        reservedBy: 1, // Admin user
        reservedAt: new Date('2026-01-03T10:00:00Z'),
        expiresAt: new Date('2026-01-10T10:00:00Z'), // Expires in 7 days
        status: ReservationStatus.ACTIVE,
        notes: 'Reserved for customer quote - 4 tires for Toyota Corolla',
      },
      {
        variantId: 1,
        warehouseId: 1,
        orderId: null,
        customerId: null,
        quantity: 2,
        reservedBy: 1,
        reservedAt: new Date('2026-01-04T09:00:00Z'),
        expiresAt: new Date('2026-01-11T09:00:00Z'),
        status: ReservationStatus.ACTIVE,
        notes: 'Walk-in customer - checking availability for weekend purchase',
      },
      {
        variantId: 5,
        warehouseId: 2,
        orderId: null,
        customerId: null,
        quantity: 4,
        reservedBy: 1,
        reservedAt: new Date('2026-01-02T14:00:00Z'),
        expiresAt: new Date('2026-01-09T14:00:00Z'),
        status: ReservationStatus.ACTIVE,
        notes: 'Fleet customer - pending approval for Honda Accord',
      },
      {
        variantId: 10,
        warehouseId: 1,
        orderId: null,
        customerId: null,
        quantity: 4,
        reservedBy: 1,
        reservedAt: new Date('2025-12-28T11:00:00Z'),
        expiresAt: new Date('2026-01-04T11:00:00Z'), // Already expired
        status: ReservationStatus.ACTIVE, // Will be marked as expired
        notes: 'Premium customer reservation - needs to be followed up',
      },
      {
        variantId: 1,
        warehouseId: 1,
        orderId: null,
        customerId: null,
        quantity: 4,
        reservedBy: 1,
        reservedAt: new Date('2025-12-20T15:00:00Z'),
        expiresAt: null, // No expiration
        status: ReservationStatus.CANCELLED,
        notes: 'Customer cancelled - found cheaper alternative elsewhere',
      },
    ];

    for (const data of reservationsData) {
      const reservation = new InventoryReservation(
        undefined,
        data.variantId,
        data.warehouseId,
        data.orderId,
        data.customerId,
        data.quantity,
        data.reservedBy,
        data.reservedAt,
        data.expiresAt,
        data.status,
        data.notes,
        data.reservedAt,
        data.reservedAt,
      );

      await this.reservations.commit(reservation);

      // Update inventory reserved quantity for active reservations
      if (data.status === ReservationStatus.ACTIVE) {
        const inventory = await this.inventories.findByVariantAndWarehouse(
          data.variantId,
          data.warehouseId,
        );

        if (inventory) {
          inventory.setReservedQuantity(
            inventory.getReservedQuantity() + data.quantity,
          );
          inventory.setUpdatedAt(new Date());
          await this.inventories.commit(inventory);
        }
      }
    }

    console.log(`✓ Created ${reservationsData.length} inventory reservations`);
    console.log(
      `  - ${reservationsData.filter((r) => r.status === ReservationStatus.ACTIVE).length} active reservations`,
    );
    console.log(
      `  - ${reservationsData.filter((r) => r.expiresAt && new Date(r.expiresAt) < new Date()).length} expired reservations (need cleanup)`,
    );
    console.log(
      `  - ${reservationsData.filter((r) => r.status === ReservationStatus.CANCELLED).length} cancelled reservations`,
    );
  }
}
