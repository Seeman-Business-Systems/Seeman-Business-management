import { Command } from '@nestjs/cqrs';
import Branch from 'src/domain/branch/branch';
import BranchStatus from 'src/domain/branch/branch-status';

class CreateBranchCommand extends Command<Branch> {
  constructor(
    public readonly name: string,
    public readonly address: string,
    public readonly city: string,
    public readonly state: string,
    public readonly status: BranchStatus,
    public readonly phoneNumber: string,
    public readonly managerId: number,
    public readonly isHeadOffice: boolean = false,
    public readonly createdBy: number,
    public readonly altPhoneNumber?: string,
    public readonly code?: string,
  ) {
    super();
  }
}

export default CreateBranchCommand;
