import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteBranchCommand from './delete-branch.command';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';

@CommandHandler(DeleteBranchCommand)
class DeleteBranch implements ICommandHandler<DeleteBranchCommand> {
  constructor(private branches: BranchRepository) {}

  async execute(command: DeleteBranchCommand): Promise<void> {
    const branch = await this.branches.findById(command.id);

    if (!branch) {
      throw new Error(`Branch with id ${command.id} not found`);
    }

    await this.branches.delete(command.id);
  }
}

export default DeleteBranch;
