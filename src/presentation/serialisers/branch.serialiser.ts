import { Injectable } from '@nestjs/common';
import Branch from 'src/domain/branch/branch';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class BranchSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(branch: Branch) {
    const manager = await this.staff.findById(branch.getManagerId());
    const creator = await this.staff.findById(branch.getCreatedBy());

    return {
      id: branch.getId(),
      name: branch.getName(),
      address: branch.getAddress(),
      city: branch.getCity(),
      state: branch.getState(),
      status: branch.getStatus(),
      phoneNumber: branch.getPhoneNumber(),
      manager: manager ? this.staffSerialiser.serialise(manager) : null,
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      isHeadOffice: branch.getIsHeadOffice(),
      code: branch.getCode(),
      altPhoneNumber: branch.getAltPhoneNumber(),
      createdAt: branch.getCreatedAt(),
      updatedAt: branch.getUpdatedAt(),
      deletedAt: branch.getDeletedAt(),
    };
  }

  async serialiseMany(branches: Branch[]) {
    return Promise.all(branches.map((branch) => this.serialise(branch)));
  }
}

export default BranchSerialiser;
