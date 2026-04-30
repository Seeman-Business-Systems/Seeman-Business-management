import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SalePayment from 'src/domain/sale/sale-payment';
import SalePaymentEntity from '../../entities/sale-payment.entity';
import SalePaymentRepository from './sale-payment.repository';

@Injectable()
class SalePaymentDBRepository extends SalePaymentRepository {
  constructor(
    @InjectRepository(SalePaymentEntity)
    private readonly repository: Repository<SalePaymentEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<SalePayment | null> {
    const record = await this.repository.findOne({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findBySale(saleId: number): Promise<SalePayment[]> {
    const records = await this.repository.find({
      where: { saleId },
    });

    return records.map((entity) => this.toDomain(entity));
  }

  async commit(payment: SalePayment): Promise<SalePayment> {
    const entity = new SalePaymentEntity();
    if (payment.getId()) {
      entity.id = payment.getId()!;
    }
    entity.saleId = payment.getSaleId()!;
    entity.amount = payment.getAmount();
    entity.paymentMethod = payment.getPaymentMethod()!;
    entity.reference = payment.getReference();
    entity.notes = payment.getNotes();
    entity.recordedBy = payment.getRecordedBy();
    entity.recordedAt = payment.getRecordedAt();

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved sale payment');
    }

    return this.toDomain(fullEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  toDomain(entity: SalePaymentEntity): SalePayment {
    return new SalePayment(
      entity.id,
      entity.saleId,
      Number(entity.amount),
      entity.paymentMethod,
      entity.reference,
      entity.notes,
      entity.recordedBy,
      entity.recordedAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default SalePaymentDBRepository;
