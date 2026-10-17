import type { ReactNode } from 'react';
import { cx } from '../utils';

export interface Step {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface StepperProps {
  steps: Step[];
  /** Index of the current step. Steps before it are complete. */
  current: number;
  /** Let people jump back to a completed step. */
  onStepClick?: (index: number) => void;
  orientation?: 'horizontal' | 'vertical';
  /** Accessible name. Default "Progress". */
  label?: string;
  className?: string;
}

/** Where someone is in a multi-step flow: what's done, what's now, what's next. */
export function Stepper({ steps, current, onStepClick, orientation = 'horizontal', label = 'Progress', className }: StepperProps) {
  return (
    <nav aria-label={label} className={cx('ts-stepper', `ts-stepper-${orientation}`, className)}>
      <ol>
        {steps.map((s, i) => {
          const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
          const clickable = !!onStepClick && i < current;
          const marker = (
            <span className="ts-step-marker" aria-hidden="true">
              {state === 'complete' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
          );
          const text = (
            <span className="ts-step-text">
              <span className="ts-step-label">{s.label}</span>
              {s.description && <span className="ts-step-desc">{s.description}</span>}
              <span className="ts-sr-only">{state === 'complete' ? ' (completed)' : state === 'upcoming' ? ' (not started)' : ''}</span>
            </span>
          );
          return (
            <li key={s.id} className={cx('ts-step', `ts-step-${state}`)} aria-current={state === 'current' ? 'step' : undefined}>
              {clickable ? (
                <button type="button" className="ts-step-btn ts-focus" onClick={() => onStepClick!(i)}>
                  {marker}
                  {text}
                </button>
              ) : (
                <div className="ts-step-btn">
                  {marker}
                  {text}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
