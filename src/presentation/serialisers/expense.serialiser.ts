import { Injectable } from '@nestjs/common';
import Expense from 'src/domain/expense/expense';
import BranchRepository from 'src/infrastructure/database/repositories/branch/branch.repository';

@Injectable()
class ExpenseSerialiser {
  constructor(private readonly branches: BranchRepository) {}

  async serialise(expense: Expense) {
    const branch = await this.branches.findById(expense.getBranchId());

    return {
      id: expense.getId(),
      amount: expense.getAmount(),
      category: expense.getCategory(),
      description: expense.getDescription(),
      branchId: expense.getBranchId(),
      branchName: branch?.getName() ?? null,
      recordedBy: expense.getRecordedBy(),
      recordedByName: expense.getRecordedByName(),
      date: expense.getDate(),
      notes: expense.getNotes(),
      createdAt: expense.getCreatedAt(),
      updatedAt: expense.getUpdatedAt(),
    };
  }

  serialiseMany(expenses: Expense[]) {
    return Promise.all(expenses.map((e) => this.serialise(e)));
  }
}

export default ExpenseSerialiser;
