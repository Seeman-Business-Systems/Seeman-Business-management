import { Injectable } from '@nestjs/common';
import SalePayment from 'src/domain/sale/sale-payment';
import SalePaymentEntity from '../../entities/sale-payment.entity';

@Injectable()
abstract class SalePaymentRepository {
  abstract findById(id: number): Promise<SalePayment | null>;
  abstract findBySale(saleId: number): Promise<SalePayment[]>;
  abstract commit(payment: SalePayment): Promise<SalePayment>;
  abstract delete(id: number): Promise<void>;
  abstract toDomain(entity: SalePaymentEntity): SalePayment;
}

export default SalePaymentRepository;
