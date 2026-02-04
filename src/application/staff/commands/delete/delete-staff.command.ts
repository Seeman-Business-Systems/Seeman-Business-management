import { Command } from '@nestjs/cqrs';

class DeleteStaffCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

export default DeleteStaffCommand;