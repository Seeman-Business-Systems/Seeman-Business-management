import { Command } from '@nestjs/cqrs';

class DeleteProductVariantCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteProductVariantCommand;
