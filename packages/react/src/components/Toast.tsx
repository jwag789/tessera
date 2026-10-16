import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cx } from '../utils';
import { CloseButton } from './Feedback';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export interface ToastProps {
  title?: ReactNode;
  icon?: IconName;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  /** Milliseconds; draws a draining timer line. Dismissal timing is up to the caller unless you use ToastProvider. */
  duration?: number;
  /** Pauses the timer line. */
  paused?: boolean;
  leaving?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/** A brief confirmation of something the user just did. Inverted in both themes. */
export function Toast({ title, icon = 'sparkle', action, onDismiss, duration, paused, leaving, className, style, children }: ToastProps) {
  return (
    <div className={cx('ts-toast', leaving && 'ts-toast-leaving', className)} role="status" style={style}>
      <Icon name={icon} />
      <div className="ts-toast-content">
        {title && <strong className="ts-toast-title">{title}</strong>}
        {children}
      </div>
      {action && (
        <button type="button" className="ts-toast-action ts-focus" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {onDismiss && <CloseButton onClick={onDismiss} />}
      {duration ? <span className="ts-toast-timer" aria-hidden="true" style={{ animationDuration: `${duration}ms`, animationPlayState: paused ? 'paused' : 'running' }} /> : null}
    </div>
  );
}

export interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  icon?: IconName;
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it leaves. Default 5000, or 8000 with an action. `Infinity` keeps it until dismissed. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: number;
  leaving?: boolean;
}

interface ToastApi {
  toast: (options: ToastOptions | string) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Shows toasts raised with `useToast()`; place once near the root of the app. */
export function ToastProvider({ children, max = 4 }: { children?: ReactNode; max?: number }) {
  const [list, setList] = useState<ToastEntry[]>([]);
  const [hovered, setHovered] = useState(false);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setList((l) => l.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 200);
  }, []);

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const o = typeof options === 'string' ? { title: options } : options;
      const id = ++nextId.current;
      setList((l) => [...l, { ...o, id }].slice(-max));
      return id;
    },
    [max]
  );

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="ts-toaster" aria-live="polite" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {list.map((t) => (
              <TimedToast key={t.id} entry={t} paused={hovered} onDismiss={() => dismiss(t.id)} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

function TimedToast({ entry, paused, onDismiss }: { entry: ToastEntry; paused: boolean; onDismiss: () => void }) {
  const duration = entry.duration ?? (entry.action ? 8000 : 5000);
  const remaining = useRef(duration);
  const started = useRef(Date.now());
  useEffect(() => {
    if (!Number.isFinite(duration) || entry.leaving) return;
    if (paused) {
      remaining.current -= Date.now() - started.current;
      return;
    }
    started.current = Date.now();
    const t = setTimeout(onDismiss, Math.max(0, remaining.current));
    return () => clearTimeout(t);
  }, [paused, duration, entry.leaving]);
  return (
    <Toast
      title={entry.title}
      icon={entry.icon ?? 'sparkle'}
      action={entry.action && { label: entry.action.label, onClick: () => (entry.action!.onClick(), onDismiss()) }}
      onDismiss={onDismiss}
      duration={Number.isFinite(duration) ? duration : undefined}
      paused={paused}
      leaving={entry.leaving}
    >
      {entry.description}
    </Toast>
  );
}

/** Raise toasts from anywhere under a ToastProvider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast() needs a <ToastProvider> above it.');
  return api;
}
