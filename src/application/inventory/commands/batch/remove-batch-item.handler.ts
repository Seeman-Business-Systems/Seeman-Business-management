import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import RemoveBatchItemCommand from './remove-batch-item.command';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';

@CommandHandler(RemoveBatchItemCommand)
class RemoveBatchItemHandler implements ICommandHandler<RemoveBatchItemCommand> {
  constructor(private readonly batchRepo: InventoryBatchRepository) {}

  async execute(command: RemoveBatchItemCommand): Promise<void> {
    const batch = await this.batchRepo.findById(command.batchId);
    if (!batch) throw new NotFoundException('Container not found');
    if (batch.isOffloaded()) throw new BadRequestException('Cannot modify an offloaded container');

    const item = await this.batchRepo.findItem(command.itemId);
    if (!item || item.getBatchId() !== command.batchId) throw new NotFoundException('Item not found on this container');

    await this.batchRepo.removeItem(command.itemId);
  }
}

export default RemoveBatchItemHandler;
