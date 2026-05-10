import { v4 as uuidv4 } from 'uuid';
import { useCreateExpenseMutation } from '../../store/api/expensesApi';
import type { CreateExpenseRequest } from '../../types/expense';
import { outbox } from './outbox';
import { useOnlineStatus } from './useOnlineStatus';

export type SubmitOutcome = { queued: boolean };

export function useCreateExpenseOffline() {
  const isOnline = useOnlineStatus();
  const [createExpense, mutationState] = useCreateExpenseMutation();

  const submit = async (data: CreateExpenseRequest): Promise<SubmitOutcome> => {
    const idempotencyKey = uuidv4();
    const payload: CreateExpenseRequest = { ...data, idempotencyKey };

    if (!isOnline) {
      await queue(idempotencyKey, payload);
      return { queued: true };
    }

    try {
      await createExpense(payload).unwrap();
      return { queued: false };
    } catch (err) {
      if (isTransportError(err)) {
        await queue(idempotencyKey, payload);
        return { queued: true };
      }
      throw err;
    }
  };

  return { submit, isLoading: mutationState.isLoading };
}

async function queue(id: string, body: CreateExpenseRequest): Promise<void> {
  await outbox.enqueue({
    id,
    resource: 'expense',
    endpoint: '/expenses',
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    invalidatesTags: ['Expense', 'Activity'],
  });
}

function isTransportError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  // RTK Query: string status === transport-level (FETCH_ERROR, TIMEOUT_ERROR, etc.)
  return typeof status === 'string';
}
