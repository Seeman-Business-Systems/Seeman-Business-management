import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import StaffTransferred from 'src/domain/staff/events/staff-transferred.event';
import TransferStaffCommand from './transfer-staff.command';

@CommandHandler(TransferStaffCommand)
class TransferStaffHandler implements ICommandHandler<TransferStaffCommand> {
  constructor(
    private readonly staffRepo: StaffRepository,
    private readonly branchRepo: BranchRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: TransferStaffCommand) {
    const staff = await this.staffRepo.findById(command.staffId);
    if (!staff) throw new NotFoundException(`Staff #${command.staffId} not found`);

    if (staff.getBranchId() === command.toBranchId) {
      throw new BadRequestException('Staff is already assigned to this branch');
    }

    const fromBranch = await this.branchRepo.findById(staff.getBranchId());
    const toBranch = await this.branchRepo.findById(command.toBranchId);
    if (!toBranch) throw new NotFoundException(`Branch #${command.toBranchId} not found`);

    const fromBranchId = staff.getBranchId();
    const fromBranchName = fromBranch?.getName() ?? `Branch #${fromBranchId}`;
    const toBranchName = toBranch.getName();

    staff.setBranchId(command.toBranchId);
    const saved = await this.staffRepo.commit(staff);

    this.eventBus.publish(
      new StaffTransferred(
        staff.getId(),
        staff.getFullName(),
        fromBranchId,
        fromBranchName,
        command.toBranchId,
        toBranchName,
        command.transferredBy,
      ),
    );

    return saved;
  }
}

export default TransferStaffHandler;
