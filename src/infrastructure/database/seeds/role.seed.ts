import { Injectable } from '@nestjs/common';
import { ActorType } from 'src/domain/common/actor-type';
import RoleRepository from '../repositories/role/role.repository';
import Role from 'src/domain/role/role';

@Injectable()
export class RoleSeed {
  constructor(
    private readonly roles: RoleRepository,
  ) {}

  async seed() {
    const existingRoles: Role[] = await this.roles.findAll();

    if (existingRoles.length > 0) {
      console.log('Roles already exist. Skipping seed.');
      return;
    }

    const defaultRoles = [
      {
        name: 'CEO',
        isManagement: true,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
      {
        name: 'Branch Manager',
        isManagement: true,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
      {
        name: 'Sales Rep',
        isManagement: false,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
      {
        name: 'Apprentice',
        isManagement: false,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
    ];

    defaultRoles.forEach((defaultRole: Role) => {
       this.roles.commit(defaultRole);
    })

    console.log('✅ Default roles seeded successfully');
  }
}
