import { Command } from '@nestjs/cqrs';

class DeleteWarehouseCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteWarehouseCommand;
