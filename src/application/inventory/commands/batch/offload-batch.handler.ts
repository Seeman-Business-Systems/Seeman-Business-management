import { CommandHandler, CommandBus, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import OffloadBatchCommand from './offload-batch.command';
import InventoryBatch from 'src/domain/inventory/inventory-batch';
import InventoryBatchRepository from 'src/infrastructure/database/repositories/inventory/inventory-batch.repository';
import AddStockCommand from '../inventory/add-stock/add-stock.command';
import ContainerOffloaded from 'src/domain/inventory/events/container-offloaded.event';

@CommandHandler(OffloadBatchCommand)
class OffloadBatchHandler implements ICommandHandler<OffloadBatchCommand> {
  constructor(
    private readonly batchRepo: InventoryBatchRepository,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: OffloadBatchCommand): Promise<InventoryBatch> {
    const batch = await this.batchRepo.findById(command.batchId);
    if (!batch) throw new NotFoundException('Container not found');
    if (batch.isOffloaded()) throw new BadRequestException('Container has already been offloaded');

    const items = await this.batchRepo.findItems(command.batchId);
    if (items.length === 0) throw new BadRequestException('Cannot offload an empty container');

    for (const item of items) {
      await this.commandBus.execute(
        new AddStockCommand(item.getVariantId(), item.getWarehouseId(), item.getQuantity(), `Offloaded from container ${batch.getBatchNumber()}`, command.actorId),
      );
    }

    batch.setOffloadedAt(new Date());
    const saved = await this.batchRepo.commit(batch);

    const totalUnits = items.reduce((sum, i) => sum + i.getQuantity(), 0);
    const warehouseIds = Array.from(new Set(items.map((i) => i.getWarehouseId())));
    this.eventBus.publish(
      new ContainerOffloaded(
        saved.getId()!,
        saved.getBatchNumber(),
        command.actorId,
        items.length,
        totalUnits,
        warehouseIds,
      ),
    );

    return saved;
  }
}

export default OffloadBatchHandler;
