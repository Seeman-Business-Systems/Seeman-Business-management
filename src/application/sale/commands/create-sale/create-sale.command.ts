import { Command } from '@nestjs/cqrs';
import Sale from 'src/domain/sale/sale';
import PaymentMethod from 'src/domain/sale/payment-method';

export interface CreateSaleLineItemInput {
  variantId: number;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
}

class CreateSaleCommand extends Command<Sale> {
  constructor(
    public readonly branchId: number,
    public readonly soldBy: number,
    public readonly paymentMethod: PaymentMethod | null,
    public readonly lineItems: CreateSaleLineItemInput[],
    public readonly customerId?: number | null,
    public readonly discountAmount?: number,
    public readonly notes?: string | null,
  ) {
    super();
  }
}

export default CreateSaleCommand;
