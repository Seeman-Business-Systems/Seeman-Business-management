import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import InventoryReservationEntity from 'src/infrastructure/database/entities/inventory-reservation.entity';
import InventoryReservationRepository from 'src/infrastructure/database/repositories/inventory/inventory-reservation.repository';
import ReservationStatus from 'src/domain/inventory/reservation-status';
import { InventoryReservationFilters } from './inventory-reservation.filters';

@Injectable()
class InventoryReservationQuery {
  constructor(
    @InjectRepository(InventoryReservationEntity)
    public readonly reservations: Repository<InventoryReservationEntity>,
    public readonly reservationRepo: InventoryReservationRepository,
  ) {}

  async findBy(
    filters: InventoryReservationFilters,
  ): Promise<InventoryReservation[]> {
    const query = this.reservations.createQueryBuilder('reservation');

    // Handle dynamic relation loading
    if (filters.includeVariant) {
      query.leftJoinAndSelect('reservation.variant', 'variant');
    }

    if (filters.includeWarehouse) {
      query.leftJoinAndSelect('reservation.warehouse', 'warehouse');
    }

    if (filters.includeReservedByStaff) {
      query.leftJoinAndSelect('reservation.reservedByStaff', 'staff');
    }

    // Handle ID filters
    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('reservation.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('reservation.id = :id', { id: filters.ids });
      }
    }

    // Handle variantId filters
    if (filters.variantId) {
      if (Array.isArray(filters.variantId)) {
        query.andWhere('reservation.variantId IN (:...variantIds)', {
          variantIds: filters.variantId,
        });
      } else {
        query.andWhere('reservation.variantId = :variantId', {
          variantId: filters.variantId,
        });
      }
    }

    // Handle warehouseId filters
    if (filters.warehouseId) {
      if (Array.isArray(filters.warehouseId)) {
        query.andWhere('reservation.warehouseId IN (:...warehouseIds)', {
          warehouseIds: filters.warehouseId,
        });
      } else {
        query.andWhere('reservation.warehouseId = :warehouseId', {
          warehouseId: filters.warehouseId,
        });
      }
    }

    // Handle orderId filters
    if (filters.orderId) {
      if (Array.isArray(filters.orderId)) {
        query.andWhere('reservation.orderId IN (:...orderIds)', {
          orderIds: filters.orderId,
        });
      } else {
        query.andWhere('reservation.orderId = :orderId', {
          orderId: filters.orderId,
        });
      }
    }

    // Handle customerId filters
    if (filters.customerId) {
      if (Array.isArray(filters.customerId)) {
        query.andWhere('reservation.customerId IN (:...customerIds)', {
          customerIds: filters.customerId,
        });
      } else {
        query.andWhere('reservation.customerId = :customerId', {
          customerId: filters.customerId,
        });
      }
    }

    // Handle status filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query.andWhere('reservation.status IN (:...statuses)', {
          statuses: filters.status,
        });
      } else {
        query.andWhere('reservation.status = :status', {
          status: filters.status,
        });
      }
    }

    // Handle reservedBy filters
    if (filters.reservedBy) {
      if (Array.isArray(filters.reservedBy)) {
        query.andWhere('reservation.reservedBy IN (:...reservedByIds)', {
          reservedByIds: filters.reservedBy,
        });
      } else {
        query.andWhere('reservation.reservedBy = :reservedBy', {
          reservedBy: filters.reservedBy,
        });
      }
    }

    // Handle isActive filter
    if (filters.isActive !== undefined) {
      if (filters.isActive) {
        query.andWhere('reservation.status = :activeStatus', {
          activeStatus: ReservationStatus.ACTIVE,
        });
      } else {
        query.andWhere('reservation.status != :activeStatus', {
          activeStatus: ReservationStatus.ACTIVE,
        });
      }
    }

    // Handle isExpired filter
    if (filters.isExpired !== undefined) {
      if (filters.isExpired) {
        query.andWhere('reservation.expiresAt IS NOT NULL');
        query.andWhere('reservation.expiresAt < :now', { now: new Date() });
        query.andWhere('reservation.status = :activeStatus', {
          activeStatus: ReservationStatus.ACTIVE,
        });
      } else {
        query.andWhere(
          '(reservation.expiresAt IS NULL OR reservation.expiresAt >= :now)',
          { now: new Date() },
        );
      }
    }

    // Default ordering - most recent first
    query.orderBy('reservation.createdAt', 'DESC');

    const records = await query.getMany();

    return records.map((entity) => this.reservationRepo.toDomain(entity));
  }

  async findExpiredReservations(): Promise<InventoryReservation[]> {
    return await this.findBy({ isExpired: true });
  }

  async getTotalReservedForVariant(
    variantId: number,
    warehouseId: number,
  ): Promise<number> {
    const reservations = await this.findBy({
      variantId,
      warehouseId,
      isActive: true,
    });

    return reservations.reduce((total, r) => total + r.getQuantity(), 0);
  }
}

export default InventoryReservationQuery;
