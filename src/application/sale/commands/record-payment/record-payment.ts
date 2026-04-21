import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import RecordSalePaymentCommand from './record-payment.command';
import SalePayment from 'src/domain/sale/sale-payment';
import PaymentStatus from 'src/domain/sale/payment-status';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import SalePaymentRepository from 'src/infrastructure/database/repositories/sale/sale-payment.repository';
import PaymentRecorded from 'src/domain/sale/events/payment-recorded.event';

@CommandHandler(RecordSalePaymentCommand)
class RecordSalePaymentHandler implements ICommandHandler<RecordSalePaymentCommand> {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly salePaymentRepository: SalePaymentRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RecordSalePaymentCommand): Promise<SalePayment> {
    // 1. Find sale
    const sale = await this.saleRepository.findById(command.saleId);
    if (!sale) {
      throw new NotFoundException(`Sale with id ${command.saleId} not found`);
    }

    // 2. Create payment
    const payment = new SalePayment(
      undefined,
      command.saleId,
      command.amount,
      command.paymentMethod,
      command.reference ?? null,
      command.notes ?? null,
      command.recordedBy,
      new Date(),
      new Date(),
      new Date(),
    );

    const savedPayment = await this.salePaymentRepository.commit(payment);

    // 3. Recalculate payment status
    const allPayments = await this.salePaymentRepository.findBySale(command.saleId);
    const totalPaid = allPayments.reduce((sum, p) => sum + p.getAmount(), 0);

    let newPaymentStatus: PaymentStatus;
    if (totalPaid >= sale.getTotalAmount()) {
      newPaymentStatus = PaymentStatus.PAID;
    } else if (totalPaid > 0) {
      newPaymentStatus = PaymentStatus.PARTIAL;
    } else {
      newPaymentStatus = PaymentStatus.PENDING;
    }

    // 4. Update sale payment status
    sale.setPaymentStatus(newPaymentStatus);
    await this.saleRepository.commit(sale);

    this.eventBus.publish(
      new PaymentRecorded(
        sale.getId()!,
        sale.getSaleNumber(),
        sale.getBranchId(),
        command.amount,
        command.recordedBy,
      ),
    );

    return savedPayment;
  }
}

export default RecordSalePaymentHandler;
