import { Command } from '@nestjs/cqrs';

class DeleteCustomerCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteCustomerCommand;