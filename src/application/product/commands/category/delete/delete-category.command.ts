import { Command } from '@nestjs/cqrs';

class DeleteCategoryCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteCategoryCommand;
