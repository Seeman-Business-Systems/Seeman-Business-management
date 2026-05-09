import { Injectable } from '@nestjs/common';
import StaffRepository from '../repositories/staff/staff.repository';
import BranchRepository from '../repositories/branch/branch.repository';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import * as bcrypt from 'bcrypt';

// Branch IDs (set by branch seed):
//   1 = Head Office (Onitsha) — main branch
//   2 = Lagos Branch 1
//   3 = Abuja Central (no staff per business directive)
//   4 = Lagos Branch 2
//
// Role IDs (set by role seed):
//   1 = Super Admin, 2 = CEO, 3 = Branch Manager, 4 = Sales Rep, 5 = Apprentice
//
// Resulting staff IDs (in seed order):
//   B1: 1 Paschal (SA), 2 Sunday (CEO), 3 manager, 4 sales, 5-7 apprentices
//   B2: 8 manager, 9 sales, 10-11 apprentices
//   B4: 12 manager, 13 sales, 14-15 apprentices

@Injectable()
export class StaffSeed {
  constructor(
    private readonly staff: StaffRepository,
    private readonly branches: BranchRepository,
  ) {}

  async seed() {
    const existingStaff = await this.staff.findAll();

    if (existingStaff.length > 0) {
      console.log('Staff already exist. Skipping seed.');
      return;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);
    const paschalPassword = await bcrypt.hash('password', 10);

    const defaultStaff: Array<Partial<Staff> & { roleId: number; branchId: number }> = [
      // --- Branch 1: Head Office (Onitsha) ---
      {
        firstName: 'Paschal',
        lastName: 'Ezenwobi',
        middleName: 'Kenechukwu',
        phoneNumber: '07861318504',
        email: 'humblekez308@gmail.com',
        roleId: 1,
        branchId: 1,
        password: paschalPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Sunday',
        lastName: 'Ezenwobi',
        phoneNumber: '+2348029200666',
        email: 'seemanauto@yahoo.com',
        roleId: 2,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Chinedu',
        lastName: 'Okeke',
        phoneNumber: '+2348031000003',
        email: 'onitsha.manager@gmail.com',
        roleId: 3,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Ifeoma',
        lastName: 'Eze',
        phoneNumber: '+2348031000004',
        email: 'onitsha.sales@gmail.com',
        roleId: 4,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Tobenna',
        lastName: 'Obi',
        phoneNumber: '+2348031000005',
        email: 'onitsha.apprentice1@gmail.com',
        roleId: 5,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Chukwudi',
        lastName: 'Nwankwo',
        phoneNumber: '+2348031000006',
        email: 'onitsha.apprentice2@gmail.com',
        roleId: 5,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Ebuka',
        lastName: 'Anyanwu',
        phoneNumber: '+2348031000007',
        email: 'onitsha.apprentice3@gmail.com',
        roleId: 5,
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },

      // --- Branch 2: Lagos Branch 1 ---
      {
        firstName: 'Adebayo',
        lastName: 'Akintola',
        phoneNumber: '+2348021000008',
        email: 'lagos1.manager@gmail.com',
        roleId: 3,
        branchId: 2,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Bisola',
        lastName: 'Ogunyemi',
        phoneNumber: '+2348021000009',
        email: 'lagos1.sales@gmail.com',
        roleId: 4,
        branchId: 2,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Tunde',
        lastName: 'Lawal',
        phoneNumber: '+2348021000010',
        email: 'lagos1.apprentice1@gmail.com',
        roleId: 5,
        branchId: 2,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Segun',
        lastName: 'Adekunle',
        phoneNumber: '+2348021000011',
        email: 'lagos1.apprentice2@gmail.com',
        roleId: 5,
        branchId: 2,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },

      // --- Branch 4: Lagos Branch 2 ---
      {
        firstName: 'Ngozi',
        lastName: 'Adeleke',
        phoneNumber: '+2348021000012',
        email: 'lagos2.manager@gmail.com',
        roleId: 3,
        branchId: 4,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Yemi',
        lastName: 'Balogun',
        phoneNumber: '+2348021000013',
        email: 'lagos2.sales@gmail.com',
        roleId: 4,
        branchId: 4,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Kehinde',
        lastName: 'Olatunji',
        phoneNumber: '+2348021000014',
        email: 'lagos2.apprentice1@gmail.com',
        roleId: 5,
        branchId: 4,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
      {
        firstName: 'Femi',
        lastName: 'Onifade',
        phoneNumber: '+2348021000015',
        email: 'lagos2.apprentice2@gmail.com',
        roleId: 5,
        branchId: 4,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: true,
      },
    ];

    for (const staffData of defaultStaff) {
      await this.staff.commit(staffData as Staff);
    }

    // Wire each branch's managerId to its newly seeded Branch Manager.
    // Manager staff IDs: B1=3, B2=8, B4=12. Abuja (B3) has no staff.
    const branchManagerLinks: Array<[number, number]> = [
      [1, 3],
      [2, 8],
      [4, 12],
    ];
    for (const [branchId, managerId] of branchManagerLinks) {
      const branch = await this.branches.findById(branchId);
      if (branch) {
        branch.setManagerId(managerId);
        branch.setUpdatedAt(new Date());
        await this.branches.commit(branch);
      }
    }

    console.log('✅ Default staff seeded successfully');
  }
}
