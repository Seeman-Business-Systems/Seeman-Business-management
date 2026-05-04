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
        address: 'F11/15 New Tyre Rd',
        city: 'Onitsha',
        state: 'Anambra',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+234803195710',
        managerId: 0,
        isHeadOffice: true,
        createdBy: ActorType.SYSTEM_ACTOR,
        createdAt: new Date(),
        updatedAt: new Date(),
        code: 'HEA',
      },
      {
        id: undefined,
        name: 'Lagos Branch 1',
        address: '11B Ebute Metta',
        city: 'Lagos',
        state: 'Lagos',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+2348029200666',
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
        name: 'Lagos Branch 2',
        address: '46 Enuowa Street',
        city: 'Ikeja',
        state: 'Lagos',
        status: BranchStatus.ACTIVE,
        phoneNumber: '+2348029200666',
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

    console.log('✅ Default branches seeded successfully');
  }
}
