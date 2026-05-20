import { v4 as uuidv4 } from 'uuid';
import { useCreateSaleMutation } from '../../store/api/salesApi';
import type { CreateSaleRequest, Sale } from '../../types/sale';
import { outbox } from './outbox';
import { useOnlineStatus } from './useOnlineStatus';

export type SaleSubmitOutcome =
  | { queued: false; sale: Sale }
  | { queued: true };

export function useCreateSaleOffline() {
  const isOnline = useOnlineStatus();
  const [createSale, mutationState] = useCreateSaleMutation();

  const submit = async (data: CreateSaleRequest): Promise<SaleSubmitOutcome> => {
    const idempotencyKey = uuidv4();
    const payload: CreateSaleRequest = { ...data, idempotencyKey };

    if (!isOnline) {
      await queue(idempotencyKey, payload);
      return { queued: true };
    }

    try {
      const sale = await createSale(payload).unwrap();
      return { queued: false, sale };
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

async function queue(id: string, body: CreateSaleRequest): Promise<void> {
  await outbox.enqueue({
    id,
    resource: 'sale',
    endpoint: '/sales',
    method: 'POST',
    body: body as unknown as Record<string, unknown>,
    invalidatesTags: ['Sale', 'Inventory', 'Supply', 'Customer', 'Activity'],
  });
}

function isTransportError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'string';
}
