import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import StockReservation from 'src/domain/inventory/stock-reservation';
import StockReservationEntity from 'src/infrastructure/database/entities/stock-reservation.entity';
import StockReservationRepository from './stock-reservation.repository';
import ReservationStatus from 'src/domain/inventory/reservation-status';

@Injectable()
class StockReservationDBRepository extends StockReservationRepository {
  constructor(
    @InjectRepository(StockReservationEntity)
    private readonly reservationRepository: Repository<StockReservationEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<StockReservation | null> {
    const entity = await this.reservationRepository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async findByOrderId(orderId: number): Promise<StockReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { orderId },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByCustomerId(customerId: number): Promise<StockReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findByVariantAndWarehouse(
    variantId: number,
    warehouseId: number,
  ): Promise<StockReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { variantId, warehouseId },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findActiveReservations(): Promise<StockReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { status: ReservationStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findExpiredReservations(): Promise<StockReservation[]> {
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

  async findByStatus(status: ReservationStatus): Promise<StockReservation[]> {
    const entities = await this.reservationRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async commit(reservation: StockReservation): Promise<StockReservation> {
    const entity = this.toEntity(reservation);
    const saved = await this.reservationRepository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.reservationRepository.delete(id);
  }

  toDomain(entity: StockReservationEntity): StockReservation {
    return new StockReservation(
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

  private toEntity(reservation: StockReservation): StockReservationEntity {
    const entity = new StockReservationEntity();
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

export default StockReservationDBRepository;