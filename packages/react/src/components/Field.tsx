import type { ReactNode } from 'react';
import { cx } from '../utils';
import { Icon } from './Icon';

export interface FieldProps {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label, control, then a hint or an error. Shared by every form control with a label above it. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cx('ts-field', error && 'ts-invalid', className)}>
      {label && (
        <label className="ts-field-label" htmlFor={id} id={`${id}-label`}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <span className="ts-field-error" id={`${id}-msg`} key="err">
          <Icon name="danger" />
          {error}
        </span>
      ) : (
        hint && (
          <span className="ts-field-hint" id={`${id}-msg`}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}

/** aria props a control needs to point at its hint or error. */
export function describedBy(id: string, hint?: ReactNode, error?: ReactNode) {
  return {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': hint || error ? `${id}-msg` : undefined
  } as const;
}
