import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import UpdateSaleCommand from './update-sale.command';
import Sale from 'src/domain/sale/sale';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';

@CommandHandler(UpdateSaleCommand)
class UpdateSaleHandler implements ICommandHandler<UpdateSaleCommand> {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(command: UpdateSaleCommand): Promise<Sale> {
    const sale = await this.saleRepository.findById(command.saleId);

    if (!sale) {
      throw new NotFoundException(`Sale with id ${command.saleId} not found`);
    }

    if (command.notes !== undefined) sale.setNotes(command.notes);
    if (command.paymentMethod !== undefined) sale.setPaymentMethod(command.paymentMethod);
    if (command.status !== undefined) sale.setStatus(command.status);

    return this.saleRepository.commit(sale);
  }
}

export default UpdateSaleHandler;
