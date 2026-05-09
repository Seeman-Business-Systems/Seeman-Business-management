import { Injectable } from '@nestjs/common';
import CustomerRepository from '../repositories/customer/customer.repository';
import Customer from 'src/domain/customer/customer';

// Customers are scoped per branch. Abuja (branch 3) has no staff
// so no customers are seeded there. createdBy points at the sales
// staff (preferred) or branch manager from the same branch.
//
// Creator IDs by branch:
//   B1 (Head Office, Onitsha): 3 = manager, 4 = sales
//   B2 (Lagos Branch 1):       8 = manager, 9 = sales
//   B4 (Lagos Branch 2):       12 = manager, 13 = sales

type SeedCustomer = {
  name: string;
  phoneNumber: string;
  email: string | null;
  companyName: string | null;
  altPhoneNumber: string | null;
  notes: string | null;
  branchId: number;
  createdBy: number;
};

const branch1Customers: SeedCustomer[] = [
  { name: 'Chukwuemeka Okonkwo', phoneNumber: '+2348031112201', email: 'chukwuemeka.okonkwo@example.com', companyName: 'Okonkwo Trading Company', altPhoneNumber: '+2348062223301', notes: 'Regular wholesale buyer, prefers bulk orders', branchId: 1, createdBy: 4 },
  { name: 'Amaka Nwosu', phoneNumber: '+2348053334401', email: 'amaka.nwosu@example.com', companyName: null, altPhoneNumber: null, notes: 'Retail customer, frequent purchaser', branchId: 1, createdBy: 4 },
  { name: 'Nzube Ozor', phoneNumber: '+2348071115501', email: 'nzube.ozor@gmail.com', companyName: 'Ozor Tricycle Hub', altPhoneNumber: '+2348092226601', notes: 'Bulk Keke tyre buyer', branchId: 1, createdBy: 3 },
  { name: 'Odiaka Mbah', phoneNumber: '+2348061117701', email: null, companyName: null, altPhoneNumber: null, notes: 'Walk-in regular', branchId: 1, createdBy: 4 },
  { name: 'Chidinma Okeke', phoneNumber: '+2348069990001', email: 'chidinma.okeke@gmail.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 1, createdBy: 4 },
  { name: 'Emeka Onuoha', phoneNumber: '+2348031234501', email: 'emeka.onuoha@example.com', companyName: 'Onuoha Auto Spares', altPhoneNumber: null, notes: 'Auto parts dealer, weekly orders', branchId: 1, createdBy: 3 },
  { name: 'Ngozi Anyanwu', phoneNumber: '+2348059876501', email: 'ngozi.anyanwu@example.com', companyName: null, altPhoneNumber: '+2348049876502', notes: null, branchId: 1, createdBy: 4 },
  { name: 'Kelechi Eze', phoneNumber: '+2348026543201', email: 'kelechi.eze@business.ng', companyName: 'Eze Logistics', altPhoneNumber: null, notes: 'Fleet account — 30-day terms', branchId: 1, createdBy: 3 },
  { name: 'Obinna Iwu', phoneNumber: '+2348087654301', email: null, companyName: 'Iwu Transport', altPhoneNumber: '+2348097654302', notes: 'Bulk battery purchaser', branchId: 1, createdBy: 3 },
  { name: 'Adaeze Ofor', phoneNumber: '+2348012345601', email: 'adaeze.ofor@gmail.com', companyName: null, altPhoneNumber: null, notes: 'Retail customer', branchId: 1, createdBy: 4 },
  { name: 'Uchenna Igwe', phoneNumber: '+2348065432101', email: 'uchenna.igwe@example.com', companyName: 'Igwe & Sons', altPhoneNumber: null, notes: null, branchId: 1, createdBy: 4 },
  { name: 'Ifeanyi Obi', phoneNumber: '+2348076543201', email: null, companyName: null, altPhoneNumber: null, notes: 'Walk-in', branchId: 1, createdBy: 4 },
  { name: 'Chioma Nnaji', phoneNumber: '+2348051234501', email: 'chioma.nnaji@gmail.com', companyName: 'Nnaji Distribution', altPhoneNumber: '+2348061234502', notes: 'Onitsha distributor', branchId: 1, createdBy: 3 },
  { name: 'Onyeka Madu', phoneNumber: '+2348039876501', email: 'onyeka.madu@example.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 1, createdBy: 4 },
  { name: 'Tochukwu Agbo', phoneNumber: '+2348048765401', email: null, companyName: 'Agbo Tyres', altPhoneNumber: null, notes: 'Tyre reseller, monthly invoicing', branchId: 1, createdBy: 3 },
];

const branch2Customers: SeedCustomer[] = [
  { name: 'Oluwaseun Adebayo', phoneNumber: '+2348075556601', email: 'oluwaseun.adebayo@business.ng', companyName: 'Adebayo Enterprises Ltd', altPhoneNumber: '+2348096667702', notes: 'Corporate client, monthly invoicing preferred', branchId: 2, createdBy: 9 },
  { name: 'Tunde Aremu', phoneNumber: '+2348023456701', email: 'tunde.aremu@example.com', companyName: null, altPhoneNumber: null, notes: 'Retail buyer', branchId: 2, createdBy: 9 },
  { name: 'Kemi Adeyemi', phoneNumber: '+2348034567801', email: 'kemi.adeyemi@gmail.com', companyName: 'Adeyemi Auto', altPhoneNumber: '+2348044567802', notes: 'Lagos auto-shop owner', branchId: 2, createdBy: 8 },
  { name: 'Femi Ogundipe', phoneNumber: '+2348045678901', email: null, companyName: null, altPhoneNumber: null, notes: null, branchId: 2, createdBy: 9 },
  { name: 'Bola Salami', phoneNumber: '+2348056789001', email: 'bola.salami@example.com', companyName: 'Salami Logistics', altPhoneNumber: null, notes: 'Bulk tyre buyer', branchId: 2, createdBy: 8 },
  { name: 'Wale Ojo', phoneNumber: '+2348067890101', email: 'wale.ojo@example.com', companyName: null, altPhoneNumber: null, notes: 'Frequent retail customer', branchId: 2, createdBy: 9 },
  { name: 'Funmi Ajibola', phoneNumber: '+2348078901201', email: null, companyName: 'Ajibola Trading', altPhoneNumber: '+2348088901202', notes: null, branchId: 2, createdBy: 8 },
  { name: 'Sola Owolabi', phoneNumber: '+2348089012301', email: 'sola.owolabi@business.ng', companyName: 'Owolabi Fleet', altPhoneNumber: null, notes: 'Fleet account', branchId: 2, createdBy: 8 },
  { name: 'Chuka Williams', phoneNumber: '+2348090123401', email: 'chuka.williams@gmail.com', companyName: null, altPhoneNumber: null, notes: 'Walk-in', branchId: 2, createdBy: 9 },
  { name: 'Aisha Bello', phoneNumber: '+2348011234501', email: 'aisha.bello@example.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 2, createdBy: 9 },
  { name: 'Tope Adeleke', phoneNumber: '+2348022345601', email: null, companyName: 'Adeleke Motors', altPhoneNumber: '+2348032345602', notes: 'Workshop account', branchId: 2, createdBy: 8 },
  { name: 'Ifeoluwa Akin', phoneNumber: '+2348033456701', email: 'ifeoluwa.akin@gmail.com', companyName: null, altPhoneNumber: null, notes: 'Retail customer', branchId: 2, createdBy: 9 },
  { name: 'Dare Olatunde', phoneNumber: '+2348044567802', email: null, companyName: 'Olatunde Spares', altPhoneNumber: null, notes: 'Spares trader', branchId: 2, createdBy: 8 },
  { name: 'Funke Adesina', phoneNumber: '+2348055678901', email: 'funke.adesina@example.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 2, createdBy: 9 },
  { name: 'Yusuf Ibrahim', phoneNumber: '+2348066789001', email: 'yusuf.ibrahim@business.ng', companyName: 'Ibrahim Transport', altPhoneNumber: '+2348076789002', notes: 'Long-haul fleet', branchId: 2, createdBy: 8 },
];

const branch4Customers: SeedCustomer[] = [
  { name: 'Fatima Ibrahim', phoneNumber: '+2348027778801', email: null, companyName: 'Ibrahim & Sons', altPhoneNumber: '+2348038889902', notes: 'Long-term customer since 2020', branchId: 4, createdBy: 12 },
  { name: 'Rotimi Aluko', phoneNumber: '+2348028889902', email: 'rotimi.aluko@example.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 4, createdBy: 13 },
  { name: 'Idris Sanni', phoneNumber: '+2348029990103', email: 'idris.sanni@gmail.com', companyName: 'Sanni Auto Hub', altPhoneNumber: null, notes: 'Workshop owner', branchId: 4, createdBy: 12 },
  { name: 'Tolu Adeoye', phoneNumber: '+2348039991204', email: null, companyName: null, altPhoneNumber: null, notes: 'Walk-in', branchId: 4, createdBy: 13 },
  { name: 'Banjo Akande', phoneNumber: '+2348049992305', email: 'banjo.akande@example.com', companyName: 'Akande Logistics', altPhoneNumber: '+2348059992306', notes: 'Fleet customer', branchId: 4, createdBy: 12 },
  { name: 'Lola Okiki', phoneNumber: '+2348059993407', email: 'lola.okiki@gmail.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 4, createdBy: 13 },
  { name: 'Hakeem Bello', phoneNumber: '+2348069994508', email: 'hakeem.bello@business.ng', companyName: 'Bello Tyres', altPhoneNumber: null, notes: 'Tyre reseller', branchId: 4, createdBy: 12 },
  { name: 'Mariam Yusuf', phoneNumber: '+2348079995609', email: null, companyName: null, altPhoneNumber: null, notes: 'Retail customer', branchId: 4, createdBy: 13 },
  { name: 'Bayo Sanyaolu', phoneNumber: '+2348089996710', email: 'bayo.sanyaolu@example.com', companyName: 'Sanyaolu Motors', altPhoneNumber: '+2348099996711', notes: 'Auto-shop owner', branchId: 4, createdBy: 12 },
  { name: 'Halima Garba', phoneNumber: '+2348019997812', email: 'halima.garba@gmail.com', companyName: null, altPhoneNumber: null, notes: null, branchId: 4, createdBy: 13 },
  { name: 'Kunle Ojora', phoneNumber: '+2348029998913', email: null, companyName: 'Ojora Trading', altPhoneNumber: null, notes: 'Bulk tyre buyer', branchId: 4, createdBy: 12 },
  { name: 'Ronke Babalola', phoneNumber: '+2348039990014', email: 'ronke.babalola@example.com', companyName: null, altPhoneNumber: null, notes: 'Walk-in', branchId: 4, createdBy: 13 },
  { name: 'Sade Adekoya', phoneNumber: '+2348049991115', email: 'sade.adekoya@business.ng', companyName: 'Adekoya Distribution', altPhoneNumber: null, notes: 'Distributor account', branchId: 4, createdBy: 12 },
  { name: 'Niyi Tijani', phoneNumber: '+2348059992216', email: null, companyName: null, altPhoneNumber: null, notes: null, branchId: 4, createdBy: 13 },
  { name: 'Chinaza Okorie', phoneNumber: '+2348069993317', email: 'chinaza.okorie@example.com', companyName: 'Okorie Spares', altPhoneNumber: '+2348079993318', notes: 'Spares dealer', branchId: 4, createdBy: 12 },
];

@Injectable()
export class CustomerSeed {
  constructor(private readonly customers: CustomerRepository) {}

  async seed() {
    const existing: Customer[] = await this.customers.findAll();

    if (existing.length > 0) {
      console.log('Customers already exist. Skipping seed.');
      return;
    }

    const allCustomers = [
      ...branch1Customers,
      ...branch2Customers,
      ...branch4Customers,
    ];

    for (const data of allCustomers) {
      const customer = new Customer(
        undefined,
        data.name,
        data.email,
        data.notes,
        data.phoneNumber,
        data.companyName,
        data.altPhoneNumber,
        0, // creditLimit
        0, // outstandingBalance
        data.createdBy,
        data.branchId,
        new Date(),
        new Date(),
        undefined,
      );
      await this.customers.commit(customer);
    }

    console.log(`✅ ${allCustomers.length} customers seeded successfully`);
  }
}
