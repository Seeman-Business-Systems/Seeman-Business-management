import { Command } from '@nestjs/cqrs';
import Staff from 'src/domain/staff/staff';

class TransferStaffCommand extends Command<Staff> {
  constructor(
    public readonly staffId: number,
    public readonly toBranchId: number,
    public readonly transferredBy: number,
  ) {
    super();
  }
}

export default TransferStaffCommand;
