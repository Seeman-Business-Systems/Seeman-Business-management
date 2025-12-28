import { Command } from '@nestjs/cqrs';

class DeleteProductCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteProductCommand;
