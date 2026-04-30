import { Command } from '@nestjs/cqrs';
import Sale from 'src/domain/sale/sale';
import PaymentMethod from 'src/domain/sale/payment-method';
import SaleStatus from 'src/domain/sale/sale-status';

class UpdateSaleCommand extends Command<Sale> {
  constructor(
    public readonly saleId: number,
    public readonly notes: string | null | undefined,
    public readonly paymentMethod: PaymentMethod | null | undefined,
    public readonly status: SaleStatus | undefined,
  ) {
    super();
  }
}

export default UpdateSaleCommand;
