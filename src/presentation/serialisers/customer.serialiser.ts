import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Customer from 'src/domain/customer/customer';
import StaffRepository from 'src/infrastructure/database/repositories/staff/staff.repository';
import { BaseStaffSerialiser } from './base-staff.serialiser';
import SaleEntity from 'src/infrastructure/database/entities/sale.entity';

@Injectable()
class CustomerSerialiser {
  constructor(
    private readonly staff: StaffRepository,
    private readonly baseStaffSerialiser: BaseStaffSerialiser,
    @InjectRepository(SaleEntity)
    private readonly salesRepository: Repository<SaleEntity>,
  ) {}

  private async computeOutstandingBalance(customerId: number): Promise<number> {
    const result = await this.salesRepository
      .createQueryBuilder('sale')
      .leftJoin('sale.payments', 'payment')
      .select('COALESCE(SUM(CAST(sale.totalAmount AS numeric)), 0)', 'totalSales')
      .addSelect('COALESCE(SUM(CAST(payment.amount AS numeric)), 0)', 'totalPaid')
      .where('sale.customerId = :customerId', { customerId })
      .andWhere(`sale.status != 'CANCELLED'`)
      .getRawOne();

    return Math.max(0, Number(result?.totalSales ?? 0) - Number(result?.totalPaid ?? 0));
  }

  async serialise(customer: Customer) {
    const creator = await this.staff.findById(customer.getCreatedBy());
    const outstandingBalance = await this.computeOutstandingBalance(customer.getId());

    return {
      id: customer.getId(),
      name: customer.getName(),
      email: customer.getEmail(),
      phoneNumber: customer.getPhoneNumber(),
      companyName: customer.getCompanyName(),
      altPhoneNumber: customer.getAltPhoneNumber(),
      notes: customer.getNotes(),
      creditLimit: customer.getCreditLimit(),
      outstandingBalance,
      availableCredit: customer.getAvailableCredit(),
      createdBy: creator ? this.baseStaffSerialiser.serialise(creator) : null,
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