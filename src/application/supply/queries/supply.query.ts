import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SupplyEntity from 'src/infrastructure/database/entities/supply.entity';
import SupplyDBRepository from 'src/infrastructure/database/repositories/supply/supply.db-repository';
import Supply from 'src/domain/supply/supply';
import type SupplyFilters from './supply.filters';

@Injectable()
class SupplyQuery {
  constructor(
    @InjectRepository(SupplyEntity)
    private readonly repository: Repository<SupplyEntity>,
    private readonly supplyRepo: SupplyDBRepository,
  ) {}

  async findBy(filters: SupplyFilters): Promise<{ data: Supply[]; total: number }> {
    const take = filters.take ?? 20;
    const skip = filters.skip ?? 0;

    const qb = this.repository
      .createQueryBuilder('supply')
      .leftJoinAndSelect('supply.items', 'items')
      .leftJoinAndSelect('supply.branch', 'branch')
      .leftJoinAndSelect('supply.suppliedByStaff', 'suppliedByStaff')
      .orderBy('supply.createdAt', 'DESC')
      .take(take)
      .skip(skip);

    if (filters.branchId) {
      qb.andWhere('supply.branchId = :branchId', { branchId: filters.branchId });
    }

    if (filters.saleId) {
      qb.andWhere('supply.saleId = :saleId', { saleId: filters.saleId });
    }

    if (filters.status) {
      qb.andWhere('supply.status = :status', { status: filters.status });
    }

    if (filters.suppliedBy) {
      qb.andWhere('supply.suppliedBy = :suppliedBy', { suppliedBy: filters.suppliedBy });
    }

    if (filters.dateFrom) {
      qb.andWhere('supply.createdAt >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
    }

    if (filters.dateTo) {
      qb.andWhere('supply.createdAt <= :dateTo', { dateTo: new Date(filters.dateTo) });
    }

    const [records, total] = await qb.getManyAndCount();

    return {
      data: records.map((e) => this.supplyRepo.toDomain(e)),
      total,
    };
  }

  async findById(id: number): Promise<Supply | null> {
    return this.supplyRepo.findById(id);
  }
}

export default SupplyQuery;
