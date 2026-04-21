import CustomerRepository from 'src/infrastructure/database/repositories/customer/customer.repository';
import { CustomerFilters } from './customer.filters';
import Customer from 'src/domain/customer/customer';
import { Repository } from 'typeorm';
import CustomerEntity from 'src/infrastructure/database/entities/customer.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
class CustomerQuery {
  constructor(
    @InjectRepository(CustomerEntity)
    public readonly customers: Repository<CustomerEntity>,
    public readonly customerRepo: CustomerRepository,
  ) {}

  async findBy(filters: CustomerFilters): Promise<Customer[]> {
    const query = this.customers.createQueryBuilder('customer');

    // Handle filters
    if (filters.name) {
      query.andWhere('customer.name ILIKE :name', {
        name: `%${filters.name}%`,
      });
    }

    if (filters.email) {
      query.andWhere('customer.email ILIKE :email', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.phoneNumber) {
      query.andWhere('customer.phone_number ILIKE :phoneNumber', {
        phoneNumber: `%${filters.phoneNumber}%`,
      });
    }

    if (filters.companyName) {
      query.andWhere('customer.company_name ILIKE :companyName', {
        companyName: `%${filters.companyName}%`,
      });
    }

    // Handle array filters for IDs
    if (filters.ids) {
      if (Array.isArray(filters.ids)) {
        query.andWhere('customer.id IN (:...ids)', { ids: filters.ids });
      } else {
        query.andWhere('customer.id = :id', { id: filters.ids });
      }
    }

    if (filters.hasOutstandingBalance === true || filters.hasOutstandingBalance === 'true') {
      query.andWhere(`(
        SELECT COALESCE(SUM(s.total_amount), 0) - COALESCE(SUM(p.amount), 0)
        FROM sales s
        LEFT JOIN sale_payments p ON p.sale_id = s.id
        WHERE s.customer_id = customer.id
          AND s.status != 'CANCELLED'
          AND s.deleted_at IS NULL
      ) > 0`);
    }

    const records = await query.getMany();

    return records.map((entity) => this.customerRepo.toDomain(entity));
  }
}

export default CustomerQuery;
