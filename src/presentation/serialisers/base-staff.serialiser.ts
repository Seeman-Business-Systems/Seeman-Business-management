import { Injectable } from '@nestjs/common';
import Staff from 'src/domain/staff/staff';

@Injectable()
export class BaseStaffSerialiser {
  serialise(staff: Staff) {
    if (!staff) return null;

    return {
      id: staff.getId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
    };
  }
}