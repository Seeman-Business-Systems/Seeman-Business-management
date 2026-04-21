import { Injectable } from '@nestjs/common';
import SaleLineItem from 'src/domain/sale/sale-line-item';
import SaleLineItemEntity from '../../entities/sale-line-item.entity';

@Injectable()
abstract class SaleLineItemRepository {
  abstract findById(id: number): Promise<SaleLineItem | null>;
  abstract findBySale(saleId: number): Promise<SaleLineItem[]>;
  abstract commit(lineItem: SaleLineItem): Promise<SaleLineItem>;
  abstract delete(id: number): Promise<void>;
  abstract toDomain(entity: SaleLineItemEntity): SaleLineItem;
}

export default SaleLineItemRepository;
