import { Command } from '@nestjs/cqrs';

class DeleteBranchCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteBranchCommand;