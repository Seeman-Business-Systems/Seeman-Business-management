import { Command } from '@nestjs/cqrs';

class DeleteExpenseCommand extends Command<void> {
  constructor(public readonly expenseId: number) {
    super();
  }
}

export default DeleteExpenseCommand;
