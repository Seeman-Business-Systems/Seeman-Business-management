import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import TransactionRunner from 'src/application/shared/transactions/transaction-runner';
import TransactionContext from 'src/application/shared/transactions/transaction-context';
import TypeOrmTransactionContext from './typeorm-transaction-context';

@Injectable()
class TypeOrmTransactionRunner extends TransactionRunner {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async run<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const ctx = new TypeOrmTransactionContext(manager);
      return work(ctx);
    });
  }
}

export default TypeOrmTransactionRunner;
