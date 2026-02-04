import { Injectable } from '@nestjs/common';
import Role from 'src/domain/role/role';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { BaseStaffSerialiser } from './base-staff.serialiser';

@Injectable()
export class RoleSerialiser {
  constructor(
    private staffRepository: StaffRepository,
    private baseStaffSerialiser: BaseStaffSerialiser,
  ) {}

  async serialise(role: Role) {
    if (!role) return;

    const createdById = role.getCreatedBy();
    let createdBy: { id: number; firstName: string; lastName: string } | string | null = null;

    if (createdById === 0) {
      createdBy = 'System Actor';
    } else if (createdById) {
      const staff = await this.staffRepository.findById(createdById);
      if (staff) {
        createdBy = this.baseStaffSerialiser.serialise(staff);
      }
    }

    return {
      id: role.getId(),
      name: role.getName(),
      isManagement: role.IsManagement(),
      createdBy,
      createdAt: role.getCreatedAt(),
      updatedAt: role.getUpdatedAt(),
    };
  }

  serialiseMany(roles: Role[]) {
    return Promise.all(roles.map((role) => this.serialise(role)));
  }
}
