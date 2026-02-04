import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import DeleteStaffCommand from './delete-staff.command';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';

@CommandHandler(DeleteStaffCommand)
class DeleteStaff implements ICommandHandler<DeleteStaffCommand> {
  constructor(private staff: StaffRepository) {}

  async execute(command: DeleteStaffCommand): Promise<void> {
    const staff = await this.staff.findById(command.id);

    if (!staff) {
      throw new Error(`Staff with id ${command.id} not found`);
    }

    await this.staff.delete(command.id);
  }
}

export default DeleteStaff;
