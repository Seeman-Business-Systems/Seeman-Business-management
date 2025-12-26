import Staff from 'src/domain/staff/staff';

export class StaffSerialiser {
  constructor() {}

  serialise(staff: Staff) {
    if (!staff) return;

    return {
      id: staff.getId(),
      firstName: staff.getFirstName(),
      lastName: staff.getLastName(),
      email: staff.getEmail(),
      phoneNumber: staff.getPhoneNumber(),
      role: staff.getRoleId(),
    };
  }

  serialiseMany(staff: Staff[]) {
    return Promise.all(staff.map((staff) => this.serialise(staff)));
  }
}

class BaseStaffSerialiser {
  constructor() {}

  serialise(staff: Staff) {
    return {};
  }
}

export default BaseStaffSerialiser;
