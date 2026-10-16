import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: ReactNode;
  /** Leading icon. */
  icon?: IconName;
  hint?: ReactNode;
  /** Replaces the hint, marks the field invalid and shakes it once. */
  error?: ReactNode;
}

/** A labelled single-line input. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, icon, hint, error, className, id: idProp, type = 'text', ...rest },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className="ts-control">
        {icon && <Icon name={icon} />}
        <input ref={ref} type={type} {...rest} id={id} className="ts-input" {...describedBy(id, hint, error)} />
      </div>
    </Field>
  );
});
