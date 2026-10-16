import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx, useControllable } from '../utils';
import { normalizeOptions } from './Select';
import type { OptionInput } from './Select';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

/** An independent on/off choice that applies when the form is submitted. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ label, className, ...rest }, ref) {
  return (
    <label className={cx('ts-check', className)}>
      <input ref={ref} type="checkbox" {...rest} />
      <span className="ts-check-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> {
  label?: ReactNode;
}

/** An on/off setting that applies immediately. */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ label, className, ...rest }, ref) {
  return (
    <label className={cx('ts-switch', className)}>
      <input ref={ref} type="checkbox" role="switch" {...rest} />
      <span className="ts-switch-track" />
      {label && <span>{label}</span>}
    </label>
  );
});

export interface RadioGroupProps {
  label?: ReactNode;
  name?: string;
  options: OptionInput[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/** 2–5 mutually exclusive options, all visible. */
export function RadioGroup({ label, name: nameProp, options, value: valueProp, defaultValue, onChange, className }: RadioGroupProps) {
  const auto = useId();
  const name = nameProp ?? auto;
  const [value, setValue] = useControllable<string | undefined>(valueProp, defaultValue, (v) => v !== undefined && onChange?.(v));
  return (
    <fieldset className={cx('ts-radio-group', className)}>
      {label && <legend>{label}</legend>}
      {normalizeOptions(options).map((o) => (
        <label key={o.value} className="ts-radio">
          <input type="radio" name={name} value={o.value} disabled={o.disabled} checked={value === o.value} onChange={() => setValue(o.value)} />
          <span className="ts-radio-dot" />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
