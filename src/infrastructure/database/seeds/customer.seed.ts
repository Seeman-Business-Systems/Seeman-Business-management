import { Injectable } from '@nestjs/common';
import CustomerRepository from '../repositories/customer/customer.repository';
import Customer from 'src/domain/customer/customer';
import { ActorType } from 'src/domain/common/actor-type';

@Injectable()
export class CustomerSeed {
  constructor(private readonly customers: CustomerRepository) {}

  async seed() {
    const existingCustomers: Customer[] = await this.customers.findAll();

    // Since you already have 2 customers, we'll only add more if there are less than 5
    // if (existingCustomers.length >= 5) {
    //   console.log('Sufficient customers already exist. Skipping seed.');
    //   return;
    // }

    const customersToAdd = 5 - existingCustomers.length;
    console.log(`Adding ${customersToAdd} additional customers...`);

    const defaultCustomers = [
      {
        name: 'Chukwuemeka Okonkwo',
        phoneNumber: '+234-803-111-2222',
        email: 'chukwuemeka.okonkwo@example.com',
        companyName: 'Okonkwo Trading Company',
        altPhoneNumber: '+234-806-222-3333',
        notes: 'Regular wholesale buyer, prefers bulk orders',
      },
      {
        name: 'Amaka Nwosu',
        phoneNumber: '+234-805-333-4444',
        email: 'amaka.nwosu@example.com',
        companyName: null,
        altPhoneNumber: null,
        notes: 'Retail customer, frequent purchaser',
      },
      {
        name: 'Oluwaseun Adebayo',
        phoneNumber: '+234-807-555-6666',
        email: 'oluwaseun.adebayo@business.ng',
        companyName: 'Adebayo Enterprises Ltd',
        altPhoneNumber: '+234-809-666-7777',
        notes: 'Corporate client, monthly invoicing preferred',
      },
      {
        name: 'Fatima Ibrahim',
        phoneNumber: '+234-802-777-8888',
        email: null,
        companyName: 'Ibrahim & Sons',
        altPhoneNumber: '+234-803-888-9999',
        notes: 'Long-term customer since 2020',
      },
      {
        name: 'Chidinma Okeke',
        phoneNumber: '+234-806-999-0000',
        email: 'chidinma.okeke@gmail.com',
        companyName: null,
        altPhoneNumber: null,
        notes: null,
      },
    ];

    // Only seed the number of customers needed
    const customersToSeed = defaultCustomers.slice(0, customersToAdd);

    for (const customerData of customersToSeed) {
      const customer = new Customer(
        undefined,
        customerData.name,
        customerData.email,
        customerData.notes,
        customerData.phoneNumber,
        customerData.companyName,
        customerData.altPhoneNumber,
        0, // creditLimit - default to 0
        0, // outstandingBalance - starts at 0
        2,
        new Date(),
        new Date(),
        undefined,
      );
      await this.customers.commit(customer);
    }

    console.log(`✅ ${customersToAdd} customer(s) seeded successfully`);
  }
}