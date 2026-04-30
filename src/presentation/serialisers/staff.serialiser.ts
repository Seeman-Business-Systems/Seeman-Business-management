import { Injectable } from '@nestjs/common';
import Staff from 'src/domain/staff/staff';
import Branch from 'src/domain/branch/branch';
import { RoleSerialiser } from './role.serialiser';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';
import RoleRepository from 'src/infrastructure/database/repositories/role/role.repository';

@Injectable()
export class StaffSerialiser {
  constructor(
    private roleSerialiser: RoleSerialiser,
    private branches: BranchRepository,
    private roles: RoleRepository,
  ) {}

  async serialise(staff: Staff) {
    if (!staff) return;

    const branch = await this.branches.findById(staff.getBranchId());
    const role = await this.roles.findByIdOrName(staff.getRoleId(), undefined);

    return {
      id: staff.getId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
      email: staff.getEmail(),
      phoneNumber: staff.getPhoneNumber(),
      role: role ? await this.roleSerialiser.serialise(role) : null,
      branch: branch ? this.applyBranch(branch) : null,
      middleName: staff.getMiddleName(),
      fullName: staff.getFullName(),
      joinedAt: staff.getJoinedAt(),
      lastLoginAt: staff.getLastLoginAt() ?? null,
      createdAt: staff.getCreatedAt(),
      updatedAt: staff.getUpdatedAt(),
    };
  }

  private applyBranch(branch: Branch) {
    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      state: branch.getState(),
      code: branch.getCode(),
      isHeadOffice: branch.getIsHeadOffice(),
      city: branch.getCity(),
    };
  }

  serialiseMany(staff: Staff[]) {
    return Promise.all(staff.map((staff) => this.serialise(staff)));
  }

  serialiseBase(staff: Staff) {
    if (!staff) return null;

    return {
      id: staff.getId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
    };
  }
}
