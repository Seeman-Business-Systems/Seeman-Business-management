import { Command } from '@nestjs/cqrs';
import SalePayment from 'src/domain/sale/sale-payment';
import PaymentMethod from 'src/domain/sale/payment-method';

class RecordSalePaymentCommand extends Command<SalePayment> {
  constructor(
    public readonly saleId: number,
    public readonly amount: number,
    public readonly paymentMethod: PaymentMethod,
    public readonly recordedBy: number,
    public readonly reference?: string | null,
    public readonly notes?: string | null,
  ) {
    super();
  }
}

export default RecordSalePaymentCommand;
