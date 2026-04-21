import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import ExpenseEntity from 'src/infrastructure/database/entities/expense.entity';
import ExpenseDBRepository from 'src/infrastructure/database/repositories/expense/expense.db-repository';
import Expense from 'src/domain/expense/expense';
import type { ExpenseFilters } from './expense.filters';

@Injectable()
class ExpenseQuery {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly repository: Repository<ExpenseEntity>,
    private readonly expenseRepo: ExpenseDBRepository,
  ) {}

  async findBy(filters: ExpenseFilters): Promise<{ data: Expense[]; total: number }> {
    const take = filters.take ?? 20;
    const skip = filters.skip ?? 0;

    const qb = this.repository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.recorder', 'recorder')
      .orderBy('expense.date', 'DESC')
      .take(take)
      .skip(skip);

    if (filters.branchId) {
      qb.andWhere('expense.branchId = :branchId', { branchId: filters.branchId });
    }

    if (filters.category) {
      qb.andWhere('expense.category = :category', { category: filters.category });
    }

    if (filters.dateFrom) {
      qb.andWhere('expense.date >= :dateFrom', { dateFrom: new Date(filters.dateFrom) });
    }

    if (filters.dateTo) {
      qb.andWhere('expense.date <= :dateTo', { dateTo: new Date(filters.dateTo) });
    }

    const [records, total] = await qb.getManyAndCount();

    return {
      data: records.map((e) => this.expenseRepo.toDomain(e)),
      total,
    };
  }
}

export default ExpenseQuery;
