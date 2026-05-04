/**
 * Opaque handle representing an active transactional unit of work.
 *
 * The application layer treats this as a token to thread through repository
 * calls. Infrastructure implementations attach concrete state (e.g. a TypeORM
 * EntityManager) and unwrap it at the call site.
 */
interface TransactionContext {
  readonly _brand: 'TransactionContext';
}

export default TransactionContext;
