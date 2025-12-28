import { Command } from '@nestjs/cqrs';

class DeleteBrandCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteBrandCommand;
