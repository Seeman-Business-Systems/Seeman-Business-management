import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import AddBatchItemCommand from './add-batch-item.command';
import InventoryBatchItem from 'src/domain/inventory/inventory-batch-item';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';

@CommandHandler(AddBatchItemCommand)
class AddBatchItemHandler implements ICommandHandler<AddBatchItemCommand> {
  constructor(private readonly batchRepo: InventoryBatchRepository) {}

  async execute(command: AddBatchItemCommand): Promise<InventoryBatchItem> {
    const batch = await this.batchRepo.findById(command.batchId);
    if (!batch) throw new NotFoundException('Container not found');
    if (batch.isOffloaded()) throw new BadRequestException('Cannot modify an offloaded container');

    const item = new InventoryBatchItem(undefined, command.batchId, command.variantId, command.warehouseId, command.quantity);
    return this.batchRepo.addItem(item);
  }
}

export default AddBatchItemHandler;
