import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Expense from 'src/domain/expense/expense';
import ExpenseEntity from '../../entities/expense.entity';
import ExpenseRepository from './expense.repository';

@Injectable()
class ExpenseDBRepository extends ExpenseRepository {
  constructor(
    @InjectRepository(ExpenseEntity)
    private readonly repository: Repository<ExpenseEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<Expense | null> {
    const record = await this.repository.findOne({ where: { id }, relations: ['recorder'] });
    return record ? this.toDomain(record) : null;
  }

  async commit(expense: Expense): Promise<Expense> {
    const entity = new ExpenseEntity();
    if (expense.getId()) entity.id = expense.getId()!;
    entity.amount = expense.getAmount();
    entity.category = expense.getCategory();
    entity.description = expense.getDescription();
    entity.branchId = expense.getBranchId();
    entity.recordedBy = expense.getRecordedBy();
    entity.date = expense.getDate();
    entity.notes = expense.getNotes();

    const saved = await this.repository.save(entity);
    const withRelations = await this.repository.findOne({ where: { id: saved.id }, relations: ['recorder'] });
    return this.toDomain(withRelations!);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  toDomain(entity: ExpenseEntity): Expense {
    const recordedByName = entity.recorder
      ? `${entity.recorder.firstName} ${entity.recorder.lastName}`
      : null;

    return new Expense(
      entity.id,
      Number(entity.amount),
      entity.category,
      entity.description,
      entity.branchId,
      entity.recordedBy,
      recordedByName,
      entity.date,
      entity.notes,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}

export default ExpenseDBRepository;
