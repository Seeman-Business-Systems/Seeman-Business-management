import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateBranchCommand from './update-branch.command';
import Branch from 'src/domain/branch/branch';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';

@CommandHandler(UpdateBranchCommand)
class UpdateBranch implements ICommandHandler<UpdateBranchCommand> {
  constructor(private branches: BranchRepository) {}

  async execute(command: UpdateBranchCommand): Promise<Branch> {
    const branchToUpdate = await this.branches.findById(command.id);

    if (!branchToUpdate) {
      throw new Error(`Branch with id ${command.id} not found`);
    }

    branchToUpdate.setName(command.name);
    branchToUpdate.setAddress(command.address);
    branchToUpdate.setCity(command.city);
    branchToUpdate.setState(command.state);
    branchToUpdate.setStatus(command.status);
    branchToUpdate.setPhoneNumber(command.phoneNumber);
    branchToUpdate.setManagerId(command.managerId);
    branchToUpdate.setIsHeadOffice(command.isHeadOffice);

    if (command.altPhoneNumber != undefined) {
      branchToUpdate.setAltPhoneNumber(command.altPhoneNumber);
    }

    branchToUpdate.setCode(command.code);

    return await this.branches.commit(branchToUpdate);
  }
}

export default UpdateBranch;
