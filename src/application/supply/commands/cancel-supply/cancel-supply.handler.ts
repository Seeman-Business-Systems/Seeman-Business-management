import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import SupplyRepository from 'src/infrastructure/database/repositories/supply/supply.repository';
import SupplyStatus from 'src/domain/supply/supply-status';
import CancelSupplyCommand from './cancel-supply.command';

@CommandHandler(CancelSupplyCommand)
class CancelSupplyHandler implements ICommandHandler<CancelSupplyCommand> {
  constructor(private readonly supplies: SupplyRepository) {}

  async execute(command: CancelSupplyCommand) {
    const supply = await this.supplies.findById(command.supplyId);

    if (!supply) {
      throw new NotFoundException(`Supply #${command.supplyId} not found`);
    }

    if (!supply.isDraft()) {
      throw new BadRequestException(`Only DRAFT supplies can be cancelled`);
    }

    supply.setStatus(SupplyStatus.CANCELLED);

    return this.supplies.commit(supply);
  }
}

export default CancelSupplyHandler;
