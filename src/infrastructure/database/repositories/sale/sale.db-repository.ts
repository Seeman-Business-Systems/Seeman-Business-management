import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Sale from 'src/domain/sale/sale';
import SaleLineItem from 'src/domain/sale/sale-line-item';
import SalePayment from 'src/domain/sale/sale-payment';
import SaleEntity from '../../entities/sale.entity';
import SaleLineItemEntity from '../../entities/sale-line-item.entity';
import SalePaymentEntity from '../../entities/sale-payment.entity';
import SaleRepository from './sale.repository';

@Injectable()
class SaleDBRepository extends SaleRepository {
  constructor(
    @InjectRepository(SaleEntity)
    private readonly repository: Repository<SaleEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Sale | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: [
        'customer',
        'soldByStaff',
        'branch',
        'lineItems',
        'lineItems.variant',
        'payments',
        'payments.recordedByStaff',
      ],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(): Promise<Sale[]> {
    const records = await this.repository.find({
      relations: [
        'customer',
        'soldByStaff',
        'branch',
        'lineItems',
        'lineItems.variant',
        'payments',
      ],
    });

    return records.map((entity) => this.toDomain(entity));
  }

  async commit(sale: Sale): Promise<Sale> {
    const entity = new SaleEntity();
    if (sale.getId()) {
      entity.id = sale.getId()!;
    }
    entity.saleNumber = sale.getSaleNumber();
    entity.customerId = sale.getCustomerId();
    entity.soldBy = sale.getSoldBy();
    entity.branchId = sale.getBranchId();
    entity.status = sale.getStatus();
    entity.paymentStatus = sale.getPaymentStatus();
    entity.paymentMethod = sale.getPaymentMethod();
    entity.subtotal = sale.getSubtotal();
    entity.discountAmount = sale.getDiscountAmount();
    entity.totalAmount = sale.getTotalAmount();
    entity.notes = sale.getNotes();
    entity.soldAt = sale.getSoldAt();

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: [
        'customer',
        'soldByStaff',
        'branch',
        'lineItems',
        'lineItems.variant',
        'payments',
        'payments.recordedByStaff',
      ],
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved sale');
    }

    return this.toDomain(fullEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.softDelete(id);
  }

  toDomain(entity: SaleEntity): Sale {
    const lineItems: SaleLineItem[] = (entity.lineItems ?? []).map(
      (item: SaleLineItemEntity) =>
        new SaleLineItem(
          item.id,
          item.saleId,
          item.variantId,
          item.quantity,
          Number(item.unitPrice),
          Number(item.discountAmount),
          Number(item.lineTotal),
          item.createdAt,
          item.updatedAt,
          item.variant?.variantName,
          item.variant?.sku,
        ),
    );

    const payments: SalePayment[] = (entity.payments ?? []).map(
      (payment: SalePaymentEntity) =>
        new SalePayment(
          payment.id,
          payment.saleId,
          Number(payment.amount),
          payment.paymentMethod,
          payment.reference,
          payment.notes,
          payment.recordedBy,
          payment.recordedAt,
          payment.createdAt,
          payment.updatedAt,
        ),
    );

    const customer = entity.customer
      ? {
          id: entity.customer.id,
          name: entity.customer.name,
          phoneNumber: entity.customer.phoneNumber,
          email: entity.customer.email,
        }
      : null;

    const soldByData = entity.soldByStaff
      ? {
          id: entity.soldByStaff.id,
          firstName: entity.soldByStaff.firstName,
          lastName: entity.soldByStaff.lastName,
        }
      : null;

    const branchData = entity.branch
      ? {
          id: entity.branch.id,
          name: entity.branch.name,
          address: entity.branch.address ?? null,
          city: entity.branch.city ?? null,
          state: entity.branch.state ?? null,
          phoneNumber: entity.branch.phoneNumber ?? null,
        }
      : null;

    return new Sale(
      entity.id,
      entity.saleNumber,
      entity.customerId,
      entity.soldBy,
      entity.branchId,
      entity.status,
      entity.paymentStatus,
      entity.paymentMethod,
      Number(entity.subtotal),
      Number(entity.discountAmount),
      Number(entity.totalAmount),
      entity.notes,
      entity.soldAt,
      entity.createdAt,
      entity.updatedAt,
      entity.deletedAt,
      lineItems,
      payments,
      customer,
      soldByData,
      branchData,
    );
  }
}

export default SaleDBRepository;
