import { Injectable } from '@nestjs/common';
import Sale from 'src/domain/sale/sale';
import SaleEntity from '../../entities/sale.entity';

@Injectable()
abstract class SaleRepository {
  abstract findById(id: number): Promise<Sale | null>;
  abstract findAll(): Promise<Sale[]>;
  abstract commit(sale: Sale): Promise<Sale>;
  abstract delete(id: number): Promise<void>;
  abstract toDomain(entity: SaleEntity): Sale;
}

export default SaleRepository;
