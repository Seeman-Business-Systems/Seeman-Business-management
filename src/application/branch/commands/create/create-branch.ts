import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import CreateBranchCommand from './create-branch.command';
import Branch from 'src/domain/branch/branch';
import BranchCreated from 'src/domain/branch/events/branch-created.event';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';

@CommandHandler(CreateBranchCommand)
class CreateBranch implements ICommandHandler<CreateBranchCommand> {
  constructor(
    private branches: BranchRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateBranchCommand): Promise<Branch> {
    const branch = new Branch(
      undefined,
      command.name,
      command.address,
      command.city,
      command.state,
      command.status,
      command.phoneNumber,
      command.managerId,
      command.isHeadOffice,
      command.createdBy,
      new Date(),
      new Date(),
      undefined,
      command.altPhoneNumber,
      command.code,
    );

    const createdBranch = await this.branches.commit(branch);

    this.eventBus.publish(
      new BranchCreated(
        createdBranch.getId() as number,
        createdBranch.getName(),
        createdBranch.getCreatedBy(),
        createdBranch.getCreatedAt(),
        createdBranch.getCode(),
      ),
    );

    return createdBranch;
  }
}

export default CreateBranch;
