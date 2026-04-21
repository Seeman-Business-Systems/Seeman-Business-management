import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SaleLineItem from 'src/domain/sale/sale-line-item';
import SaleLineItemEntity from '../../entities/sale-line-item.entity';
import SaleLineItemRepository from './sale-line-item.repository';

@Injectable()
class SaleLineItemDBRepository extends SaleLineItemRepository {
  constructor(
    @InjectRepository(SaleLineItemEntity)
    private readonly repository: Repository<SaleLineItemEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<SaleLineItem | null> {
    const record = await this.repository.findOne({
      where: { id },
      relations: ['variant'],
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findBySale(saleId: number): Promise<SaleLineItem[]> {
    const records = await this.repository.find({
      where: { saleId },
      relations: ['variant'],
    });

    return records.map((entity) => this.toDomain(entity));
  }

  async commit(lineItem: SaleLineItem): Promise<SaleLineItem> {
    const entity = new SaleLineItemEntity();
    if (lineItem.getId()) {
      entity.id = lineItem.getId()!;
    }
    entity.saleId = lineItem.getSaleId()!;
    entity.variantId = lineItem.getVariantId();
    entity.quantity = lineItem.getQuantity();
    entity.unitPrice = lineItem.getUnitPrice();
    entity.discountAmount = lineItem.getDiscountAmount();
    entity.lineTotal = lineItem.getLineTotal();

    const savedEntity = await this.repository.save(entity);
    const fullEntity = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['variant'],
    });

    if (!fullEntity) {
      throw new Error('Failed to retrieve saved sale line item');
    }

    return this.toDomain(fullEntity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  toDomain(entity: SaleLineItemEntity): SaleLineItem {
    return new SaleLineItem(
      entity.id,
      entity.saleId,
      entity.variantId,
      entity.quantity,
      Number(entity.unitPrice),
      Number(entity.discountAmount),
      Number(entity.lineTotal),
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default SaleLineItemDBRepository;
