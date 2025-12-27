import { Injectable } from '@nestjs/common';
import BranchRepository from '../repositories/branch/branch.repository';
import Branch from 'src/domain/branch/branch';
import BranchStatus from 'src/domain/branch/branch-status';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class BranchSeed {
  constructor(
    private readonly branches: BranchRepository,
  ) {}

  async seed() {
    const existingBranches: Branch[] = await this.branches.findAll();

    if (existingBranches.length > 0) {
      console.log('Branches already exist. Skipping seed.');
      return;
    }

    const defaultBranches = [
      {
        id: undefined,
        name: 'Head Office',
        address: '123 Main Street',
        city: 'Onitsha',
        state: 'Anambra',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+234-803-123-4567',
        managerId: 0,
        isHeadOffice: true,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
        code: 'HEA',
      },
      {
        id: undefined,
        name: 'Lagos Island Branch',
        address: '45 Marina Road',
        city: 'Lagos',
        state: 'Lagos',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+234-802-234-5678',
        managerId: 0,
        isHeadOffice: false,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
        code: 'LAG',
      },
      {
        id: undefined,
        name: 'Abuja Central Branch',
        address: '78 Central Business District',
        city: 'Abuja',
        state: 'FCT',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+234-809-345-6789',
        managerId: 0,
        isHeadOffice: false,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
        code: 'ABJ',
      },
      {
        id: undefined,
        name: 'Onitsha Main Market Branch',
        address: '12 Upper Iweka Road',
        city: 'Onitsha',
        state: 'Anambra',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+234-805-456-7890',
        managerId: 0,
        isHeadOffice: false,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
        code: 'ONT',
      },
    ];

    for (const branchData of defaultBranches) {
      const branch = new Branch(
        branchData.id,
        branchData.name,
        branchData.address,
        branchData.city,
        branchData.state,
        branchData.status,
        branchData.phoneNumber,
        branchData.managerId,
        branchData.isHeadOffice,
        branchData.createdBy,
        branchData.createdAt,
        branchData.updatedAt,
        undefined,
        undefined,
        branchData.code,
      );
      await this.branches.commit(branch);
    }

    console.log('Default branches seeded successfully');
  }
}
