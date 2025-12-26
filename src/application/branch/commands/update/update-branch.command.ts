import { Command } from "@nestjs/cqrs";
import Branch from "src/domain/branch/branch";
import BranchStatus from "src/domain/branch/branch-status";

class UpdateBranchCommand extends Command<Branch> {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly address: string,
    public readonly city: string,
    public readonly state: string,
    public readonly status: BranchStatus,
    public readonly phoneNumber: string,
    public readonly managerId: number,
    public readonly isHeadOffice: boolean,
    public readonly code: string,
    public readonly altPhoneNumber?: string,
  ) {
    super();
  }
}

export default UpdateBranchCommand;