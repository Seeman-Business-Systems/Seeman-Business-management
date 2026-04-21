import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Sale from 'src/domain/sale/sale';
import SaleEntity from 'src/infrastructure/database/entities/sale.entity';
import SaleRepository from 'src/infrastructure/database/repositories/sale/sale.repository';
import { SaleFilters } from './sale.filters';

@Injectable()
class SaleQuery {
  constructor(
    @InjectRepository(SaleEntity)
    public readonly sales: Repository<SaleEntity>,
    public readonly saleRepo: SaleRepository,
  ) {}

  async findBy(filters: SaleFilters): Promise<{ data: Sale[]; total: number }> {
    const query = this.sales
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.soldByStaff', 'soldBy')
      .leftJoinAndSelect('sale.branch', 'branch')
      .leftJoinAndSelect('sale.lineItems', 'lineItems')
      .leftJoinAndSelect('lineItems.variant', 'variant')
      .leftJoinAndSelect('sale.payments', 'payments');

    if (filters.customerId) {
      query.andWhere('customer.id = :customerId', { customerId: filters.customerId });
    }

    if (filters.branchId) {
      query.andWhere('branch.id = :branchId', { branchId: filters.branchId });
    }

    if (filters.status) {
      query.andWhere('sale.status = :status', { status: filters.status });
    }

    if (filters.paymentStatus) {
      query.andWhere('sale.paymentStatus = :paymentStatus', { paymentStatus: filters.paymentStatus });
    }

    if (filters.dateFrom) {
      query.andWhere('sale.soldAt >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      query.andWhere('sale.soldAt <= :dateTo', { dateTo });
    }

    if (filters.search) {
      query.andWhere(
        '(sale.saleNumber ILIKE :search OR customer.name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('sale.soldAt', 'DESC');

    const total = await query.getCount();

    if (filters.skip !== undefined) {
      query.skip(filters.skip);
    }

    if (filters.take !== undefined) {
      query.take(filters.take);
    }

    const records = await query.getMany();

    return {
      data: records.map((entity) => this.saleRepo.toDomain(entity)),
      total,
    };
  }

  async findById(id: number): Promise<Sale | null> {
    const record = await this.sales
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.customer', 'customer')
      .leftJoinAndSelect('sale.soldByStaff', 'soldBy')
      .leftJoinAndSelect('sale.branch', 'branch')
      .leftJoinAndSelect('sale.lineItems', 'lineItems')
      .leftJoinAndSelect('lineItems.variant', 'variant')
      .leftJoinAndSelect('sale.payments', 'payments')
      .leftJoinAndSelect('payments.recordedByStaff', 'recordedBy')
      .where('sale.id = :id', { id })
      .getOne();

    if (!record) {
      return null;
    }

    return this.saleRepo.toDomain(record);
  }
}

export default SaleQuery;
