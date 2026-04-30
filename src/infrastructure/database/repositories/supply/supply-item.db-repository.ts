import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SupplyItem from 'src/domain/supply/supply-item';
import SupplyItemEntity from '../../entities/supply-item.entity';
import SupplyItemRepository from './supply-item.repository';

@Injectable()
class SupplyItemDBRepository extends SupplyItemRepository {
  constructor(
    @InjectRepository(SupplyItemEntity)
    private readonly repository: Repository<SupplyItemEntity>,
  ) {
    super();
  }

  async commitMany(items: SupplyItem[]): Promise<SupplyItem[]> {
    const entities = items.map((item) => {
      const entity = new SupplyItemEntity();
      if (item.getId()) entity.id = item.getId()!;
      entity.supplyId = item.getSupplyId();
      entity.variantId = item.getVariantId();
      entity.variantName = item.getVariantName();
      entity.quantity = item.getQuantity();
      entity.warehouseId = item.getWarehouseId();
      return entity;
    });

    const saved = await this.repository.save(entities);
    return saved.map((e) => this.toDomain(e));
  }

  toDomain(entity: SupplyItemEntity): SupplyItem {
    return new SupplyItem(
      entity.id,
      entity.supplyId,
      entity.variantId,
      entity.variantName,
      entity.quantity,
      entity.createdAt,
      entity.warehouseId,
    );
  }
}

export default SupplyItemDBRepository;
