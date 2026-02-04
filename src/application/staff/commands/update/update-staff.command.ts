import { Command } from '@nestjs/cqrs';
import Staff from 'src/domain/staff/staff';

class UpdateStaffCommand extends Command<Staff> {
  constructor(
    public readonly id: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phoneNumber: string,
    public readonly roleId: number,
    public readonly branchId: number,
    public readonly middleName?: string,
    public readonly email?: string,
    public readonly joinedAt?: Date,
  ) {
    super();
  }
}

export default UpdateStaffCommand;
