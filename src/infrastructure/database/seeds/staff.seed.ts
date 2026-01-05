import { Injectable } from '@nestjs/common';
import StaffRepository from '../repositories/staff/staff.repository';
import Staff from 'src/domain/staff/staff';
import { ActorType } from 'src/domain/common/actor-type';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffSeed {
  constructor(
    private readonly staff: StaffRepository,
  ) {}

  async seed() {
    const existingStaff = await this.staff.findAll();

    if (existingStaff.length > 0) {
      console.log('Staff already exist. Skipping seed.');
      return;
    }

    const defaultPassword = await bcrypt.hash('password123', 10);

    const defaultStaff = [
      {
        firstName: 'Chukwuemeka',
        lastName: 'Okonkwo',
        middleName: 'Obiora',
        phoneNumber: '+234-803-123-4567',
        email: 'chukwuemeka.okonkwo@seeman.com',
        roleId: 1, // CEO
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: false,
      },
      {
        firstName: 'Chidinma',
        lastName: 'Nwosu',
        middleName: 'Adaeze',
        phoneNumber: '+234-805-234-5678',
        email: 'chidinma.nwosu@seeman.com',
        roleId: 2, // Branch Manager
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: false,
      },
      {
        firstName: 'Ikenna',
        lastName: 'Eze',
        middleName: 'Chinedu',
        phoneNumber: '+234-807-345-6789',
        email: 'ikenna.eze@seeman.com',
        roleId: 3, // Sales Representative
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: false,
      },
      {
        firstName: 'Olisa',
        lastName: 'Mbah',
        middleName: 'Lotanna',
        phoneNumber: '+234-907-365-6219',
        email: 'Olisa.Mbah@seeman.com',
        roleId: 4, // Apprentice
        branchId: 1,
        password: defaultPassword,
        createdBy: ActorType.SYSTEM_ACTOR,
        initialPasswordChanged: false,
      },
    ];

    for (const staffData of defaultStaff) {
      await this.staff.commit(staffData as Staff);
    }

    console.log('✅ Default staff seeded successfully');
  }
}
