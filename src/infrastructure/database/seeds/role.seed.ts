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
    const defaultRoles = [
      {
        name: 'Super Admin',
        isManagement: true,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
      {
        name: 'CEO',
        isManagement: true,
        createdBy: ActorType.SYSTEM_ACTOR,
      },
      {
        name: 'Branch Manager',
        isManagement: false,
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

    let inserted = 0;
    for (const defaultRole of defaultRoles) {
      const existing = await this.roles.findByIdOrName(undefined, defaultRole.name);
      if (existing) continue;
      await this.roles.commit(defaultRole as Role);
      inserted++;
    }

    console.log(`✅ Roles seed: ${inserted} inserted, ${defaultRoles.length - inserted} already present`);
  }
}
