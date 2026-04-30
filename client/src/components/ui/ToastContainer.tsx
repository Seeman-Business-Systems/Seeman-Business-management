import { useEffect, useRef, useState } from 'react';
import { useToast, type Toast, type ToastType } from '../../context/ToastContext';

const toastStyles: Record<ToastType, { bg: string; icon: string; iconColor: string; progress: string }> = {
  success: {
    bg: 'bg-white',
    icon: 'fa-solid fa-circle-check',
    iconColor: 'text-green-500',
    progress: 'bg-green-500',
  },
  error: {
    bg: 'bg-white',
    icon: 'fa-solid fa-circle-xmark',
    iconColor: 'text-red-500',
    progress: 'bg-red-500',
  },
  info: {
    bg: 'bg-white',
    icon: 'fa-solid fa-circle-info',
    iconColor: 'text-blue-500',
    progress: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-white',
    icon: 'fa-solid fa-triangle-exclamation',
    iconColor: 'text-amber-500',
    progress: 'bg-amber-500',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const style = toastStyles[toast.type];

  const remainingRef = useRef(toast.duration ?? 0);
  const startTimeRef = useRef(0);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
  };

  const startTimers = (remaining: number) => {
    clearTimers();
    startTimeRef.current = Date.now();
    exitTimerRef.current = setTimeout(() => setIsLeaving(true), Math.max(0, remaining - 300));
    removeTimerRef.current = setTimeout(onRemove, remaining);
  };

  useEffect(() => {
    const enterTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      remainingRef.current = toast.duration;
      startTimers(toast.duration);
    }
    return clearTimers;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = () => {
    if (!toast.duration) return;
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimers();
  };

  const handleMouseLeave = () => {
    if (!toast.duration) return;
    setIsPaused(false);
    startTimers(remainingRef.current);
  };

  const handleClose = () => {
    clearTimers();
    setIsLeaving(true);
    setTimeout(onRemove, 300);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-start gap-3 w-80 p-4 rounded-lg shadow-lg border border-gray-200 ${style.bg} transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : '-translate-x-full opacity-0'
      }`}
    >
      {/* Icon */}
      <i className={`${style.icon} ${style.iconColor} text-lg mt-0.5`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 font-medium capitalize">{toast.type}</p>
        <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-lg">
          <div
            className={`h-full ${style.progress}`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
