import { Injectable } from '@nestjs/common';
import Customer from 'src/domain/customer/customer';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { StaffSerialiser } from './staff.serialiser';

@Injectable()
class CustomerSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly staffSerialiser: StaffSerialiser,
  ) {}

  async serialise(customer: Customer) {
    const creator = await this.staff.findById(customer.getCreatedBy());

    return {
      id: customer.getId(),
      name: customer.getName(),
      email: customer.getEmail(),
      phoneNumber: customer.getPhoneNumber(),
      companyName: customer.getCompanyName(),
      altPhoneNumber: customer.getAltPhoneNumber(),
      notes: customer.getNotes(),
      createdBy: creator ? this.staffSerialiser.serialise(creator) : null,
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
      deletedAt: customer.getDeletedAt(),
    };
  }

  async serialiseMany(customers: Customer[]) {
    return Promise.all(customers.map((customer) => this.serialise(customer)));
  }
}

export default CustomerSerialiser;