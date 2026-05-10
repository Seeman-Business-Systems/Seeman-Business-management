import { Injectable } from '@nestjs/common';
import Expense from 'src/domain/expense/expense';
import ExpenseEntity from '../../entities/expense.entity';

@Injectable()
abstract class ExpenseRepository {
  abstract findById(id: number): Promise<Expense | null>;
  abstract findByIdempotencyKey(key: string): Promise<Expense | null>;
  abstract commit(expense: Expense): Promise<Expense>;
  abstract delete(id: number): Promise<void>;
  abstract toDomain(entity: ExpenseEntity): Expense;
}

export default ExpenseRepository;
