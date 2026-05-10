import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { faCloudArrowUp, faCloudBolt, faCheckCircle, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useOnlineStatus } from '../lib/offline/useOnlineStatus';
import { usePendingCount } from '../lib/offline/useOutbox';
import { flushOutbox } from '../lib/offline/sync';
import { baseApi } from '../store/api/baseApi';

const RECONNECT_FLASH_MS = 3000;

function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const pendingCount = usePendingCount();
  const dispatch = useDispatch();

  const [reconnectFlash, setReconnectFlash] = useState<'syncing' | 'success' | 'partial' | null>(null);
  const wasOffline = useRef(!isOnline);
  const flushing = useRef(false);

  useEffect(() => {
    const runFlush = async (announce: boolean) => {
      if (flushing.current) return;
      flushing.current = true;
      if (announce) setReconnectFlash('syncing');

      try {
        const tagsToInvalidate = new Set<string>();
        const result = await flushOutbox({
          onEntrySynced: (entry) => entry.invalidatesTags.forEach((t) => tagsToInvalidate.add(t)),
        });

        if (tagsToInvalidate.size > 0) {
          // RTK Query: invalidate the affected tag types
          dispatch(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (baseApi.util.invalidateTags as any)([...tagsToInvalidate]),
          );
        }

        if (announce) {
          setReconnectFlash(result.failed.length > 0 ? 'partial' : 'success');
          window.setTimeout(() => setReconnectFlash(null), RECONNECT_FLASH_MS);
        }
      } finally {
        flushing.current = false;
      }
    };

    if (isOnline && wasOffline.current) {
      wasOffline.current = false;
      runFlush(true);
    } else if (isOnline && pendingCount > 0 && !reconnectFlash) {
      // Online on mount with pending items left over from a previous session
      runFlush(false);
    } else if (!isOnline) {
      wasOffline.current = true;
    }
  }, [isOnline, pendingCount, dispatch, reconnectFlash]);

  if (!isOnline) {
    return (
      <div className="bg-amber-500 text-white text-sm px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
        <FontAwesomeIcon icon={faCloudBolt} />
        <span>
          You're offline. Recorded actions will sync when you reconnect.
          {pendingCount > 0 && (
            <span className="ml-2 font-semibold">({pendingCount} pending)</span>
          )}
        </span>
      </div>
    );
  }

  if (reconnectFlash === 'syncing') {
    return (
      <div className="bg-blue-600 text-white text-sm px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
        <FontAwesomeIcon icon={faCloudArrowUp} className="animate-pulse" />
        <span>Back online — syncing your changes…</span>
      </div>
    );
  }

  if (reconnectFlash === 'success') {
    return (
      <div className="bg-emerald-600 text-white text-sm px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
        <FontAwesomeIcon icon={faCheckCircle} />
        <span>You're back online. Everything is synced.</span>
      </div>
    );
  }

  if (reconnectFlash === 'partial') {
    return (
      <div className="bg-rose-600 text-white text-sm px-4 py-2 flex items-center justify-center gap-2 shadow-sm">
        <FontAwesomeIcon icon={faTriangleExclamation} />
        <span>Back online, but some items couldn't sync. Check the list.</span>
      </div>
    );
  }

  return null;
}

export default OfflineBanner;
