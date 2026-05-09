import { Global, Module } from '@nestjs/common';
import TransactionRunner from 'src/application/shared/transactions/transaction-runner';
import TypeOrmTransactionRunner from 'src/infrastructure/database/transactions/typeorm-transaction-runner';

@Global()
@Module({
  providers: [{ provide: TransactionRunner, useClass: TypeOrmTransactionRunner }],
  exports: [TransactionRunner],
})
export class TransactionModule {}
