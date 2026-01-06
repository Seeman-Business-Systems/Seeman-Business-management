import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import InventoryReservation from 'src/domain/inventory/inventory-reservation';
import InventoryReservationEntity from 'src/infrastructure/database/entities/inventory-reservation.entity';
import ReservationStatus from 'src/domain/inventory/reservation-status';
import InventoryReservationRepository from './inventory-reservation.repository';

@Injectable()
class InventoryReservationDBRepository extends InventoryReservationRepository {
  constructor(
    @InjectRepository(InventoryReservationEntity)
    private readonly reservationRepository: Repository<InventoryReservationEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<InventoryReservation | null> {
    const entity = await this.reservationRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByOrderId(orderId: number): Promise<InventoryReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { orderId },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByCustomerId(customerId: number): Promise<InventoryReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<InventoryReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { variantId, warehouseId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveReservations(): Promise<InventoryReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { status: ReservationStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findExpiredReservations(): Promise<InventoryReservation[]> {
    const now = new Date();
    const entities = await this.reservationRepository.find({
      where: {
        status: ReservationStatus.EXPIRED,
        expiresAt: LessThan(now),
      },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByStatus(
    status: ReservationStatus,
  ): Promise<InventoryReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async commit(
    reservation: InventoryReservation,
  ): Promise<InventoryReservation> {
    const entity = this.toEntity(reservation);
    const saved = await this.reservationRepository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.reservationRepository.delete(id);
  }

  toDomain(entity: InventoryReservationEntity): InventoryReservation {
    return new InventoryReservation(
      entity.id,
      entity.variantId,
      entity.warehouseId,
      entity.orderId,
      entity.customerId,
      entity.quantity,
      entity.reservedBy,
      entity.reservedAt,
      entity.expiresAt,
      entity.status,
      entity.notes,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(
    reservation: InventoryReservation,
  ): InventoryReservationEntity {
    const entity = new InventoryReservationEntity();
    if (reservation.getId()) {
      entity.id = reservation.getId()!;
    }
    entity.variantId = reservation.getVariantId();
    entity.warehouseId = reservation.getWarehouseId();
    entity.orderId = reservation.getOrderId();
    entity.customerId = reservation.getCustomerId();
    entity.quantity = reservation.getQuantity();
    entity.reservedBy = reservation.getReservedBy();
    entity.reservedAt = reservation.getReservedAt();
    entity.expiresAt = reservation.getExpiresAt();
    entity.status = reservation.getStatus();
    entity.notes = reservation.getNotes();
    entity.createdAt = reservation.getCreatedAt();
    entity.updatedAt = reservation.getUpdatedAt();
    return entity;
  }
}

export default InventoryReservationDBRepository;
