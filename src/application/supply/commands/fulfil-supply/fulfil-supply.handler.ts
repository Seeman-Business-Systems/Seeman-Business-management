import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import SupplyStatus from 'src/domain/supply/supply-status';
import SupplyFulfilled from 'src/domain/supply/events/supply-fulfilled.event';
import FulfilSupplyCommand from './fulfil-supply.command';

@CommandHandler(FulfilSupplyCommand)
class FulfilSupplyHandler implements ICommandHandler<FulfilSupplyCommand> {
  constructor(
    private readonly supplies: SupplyRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: FulfilSupplyCommand) {
    const supply = await this.supplies.findById(command.supplyId);

    if (!supply) {
      throw new NotFoundException(`Supply #${command.supplyId} not found`);
    }

    if (!supply.isDraft()) {
      throw new BadRequestException(`Only DRAFT supplies can be fulfilled`);
    }

    supply.setStatus(SupplyStatus.FULFILLED);
    supply.setSuppliedBy(command.fulfilledBy);
    if (command.notes !== null) {
      supply.setNotes(command.notes);
    }

    const saved = await this.supplies.commit(supply);

    this.eventBus.publish(
      new SupplyFulfilled(
        supply.getId()!,
        supply.getSupplyNumber(),
        supply.getSaleId(),
        supply.getBranchId(),
        command.fulfilledBy,
      ),
    );

    return saved;
  }
}

export default FulfilSupplyHandler;
