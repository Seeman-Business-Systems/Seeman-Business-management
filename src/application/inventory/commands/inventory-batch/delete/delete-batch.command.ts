import { Command } from '@nestjs/cqrs';

class DeleteBatchCommand extends Command<void> {
  constructor(public readonly batchId: number) {
    super();
  }
}

export default DeleteBatchCommand;