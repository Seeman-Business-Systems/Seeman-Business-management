import { Injectable } from '@nestjs/common';
import TransactionContext from './transaction-context';

@Injectable()
abstract class TransactionRunner {
  abstract run<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

export default TransactionRunner;
