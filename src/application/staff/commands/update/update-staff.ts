import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import UpdateStaffCommand from './update-staff.command';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import Staff from 'src/domain/staff/staff';

@CommandHandler(UpdateStaffCommand)
class UpdateStaff implements ICommandHandler<UpdateStaffCommand> {
  constructor(private staff: StaffRepository) {}

  async execute(command: UpdateStaffCommand): Promise<Staff> {
    const staffToUpdate = await this.staff.findById(command.id);

    if (!staffToUpdate) {
      throw new Error(`Staff with id ${command.id} not found`);
    }

    staffToUpdate.setFirstName(command.firstName);
    staffToUpdate.setLastName(command.lastName);
    staffToUpdate.setPhoneNumber(command.phoneNumber);
    staffToUpdate.setRoleId(command.roleId);
    staffToUpdate.setBranchId(command.branchId);

    if (command.middleName) {
      staffToUpdate.setMiddleName(command.middleName);
    }

    if (command.email) {
      staffToUpdate.setEmail(command.email);
    }

    return await this.staff.commit(staffToUpdate);
  }
}

export default UpdateStaff;
