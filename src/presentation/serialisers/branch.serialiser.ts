import { Injectable } from '@nestjs/common';
import Branch from 'src/domain/branch/branch';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';
import Staff from 'src/domain/staff/staff';
import DefaultRoles from 'src/domain/role/default-roles';

@Injectable()
class BranchSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(branch: Branch, includeStaff: boolean = false) {
    const creator = await this.staff.findById(branch.getCreatedBy());
    const managerId = branch.getManagerId();
    const manager = managerId ? await this.staff.findById(managerId) : null;

    const result: any = {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      city: branch.getCity(),
      state: branch.getState(),
      status: branch.getStatus(),
      phoneNumber: branch.getPhoneNumber(),
      managerId: managerId,
      manager: manager ? this.staffSerialiser.serialiseBase(manager) : null,
      createdBy: creator ? this.staffSerialiser.serialiseBase(creator) : null,
      isHeadOffice: branch.getIsHeadOffice(),
      code: branch.getCode(),
      altPhoneNumber: branch.getAltPhoneNumber(),
      createdAt: branch.getCreatedAt(),
      updatedAt: branch.getUpdatedAt(),
      deletedAt: branch.getDeletedAt(),
    };

    if (includeStaff) {
      const staffMembers = await this.staff.findForBranch(branch.getId()!);

      result.staff = {
        manager: await this.applyManagers(staffMembers),
        salesReps: await this.applySalesReps(staffMembers),
        apprentices: await this.applyApprentices(staffMembers),
      };
    }

    return result;
  }

  private async applyManagers(staffMembers: Staff[]) {
    const managers = staffMembers.filter(
      (staff) => staff.getRoleId() === DefaultRoles.BRANCH_MANAGER,
    );
    return this.staffSerialiser.serialiseMany(managers);
  }

  private async applySalesReps(staffMembers: Staff[]) {
    const salesReps = staffMembers.filter(
      (staff) => staff.getRoleId() === DefaultRoles.SALES_REPRESENTATIVE,
    );
    return this.staffSerialiser.serialiseMany(salesReps);
  }

  private async applyApprentices(staffMembers: Staff[]) {
    const apprentices = staffMembers.filter(
      (staff) => staff.getRoleId() === DefaultRoles.APPRENTICE,
    );
    return this.staffSerialiser.serialiseMany(apprentices);
  }

  async serialiseMany(branches: Branch[], includeStaff: boolean) {
    return Promise.all(
      branches.map((branch) => this.serialise(branch, includeStaff)),
    );
  }
}

export default BranchSerialiser;
