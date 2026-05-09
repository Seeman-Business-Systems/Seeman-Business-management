import { EntityManager } from 'typeorm';
import TransactionContext from 'src/application/shared/transactions/transaction-context';

class TypeOrmTransactionContext implements TransactionContext {
  readonly _brand = 'TransactionContext' as const;

  constructor(public readonly manager: EntityManager) {}

  static unwrap(ctx?: TransactionContext): EntityManager | undefined {
    return ctx instanceof TypeOrmTransactionContext ? ctx.manager : undefined;
  }
}

export default TypeOrmTransactionContext;
