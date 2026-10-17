import { forwardRef, useId, useLayoutEffect, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, DragEvent, KeyboardEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { cx, mergeRefs, useControllable } from '../utils';
import { Field, describedBy } from './Field';
import { Icon } from './Icon';

/* ---------- Textarea ---------- */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** Grow with the content instead of scrolling. Default true. */
  autoResize?: boolean;
  /** Show "used / max" under the field when `maxLength` is set. Default true. */
  showCount?: boolean;
}

/** A labelled multi-line input that grows with its content. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, autoResize = true, showCount = true, className, id: idProp, rows = 3, onChange, value, defaultValue, maxLength, ...rest },
  ref
) {
  const auto = useId();
  const id = idProp ?? auto;
  const inner = useRef<HTMLTextAreaElement>(null);
  const [length, setLength] = useState(String(value ?? defaultValue ?? '').length);

  const fit = () => {
    const el = inner.current;
    if (!el || !autoResize) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  };
  useLayoutEffect(fit, [value, autoResize]);

  const count = maxLength && showCount ? `${length} / ${maxLength}` : null;
  return (
    <Field id={id} label={label} hint={error ? undefined : hint} error={error} className={className}>
      <textarea
        ref={mergeRefs(ref, inner)}
        {...rest}
        id={id}
        rows={rows}
        value={value}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={cx('ts-input', 'ts-textarea', autoResize && 'ts-textarea-auto')}
        {...describedBy(id, hint, error)}
        onChange={(e) => {
          setLength(e.target.value.length);
          fit();
          onChange?.(e);
        }}
      />
      {count && (
        <span className={cx('ts-count', length >= (maxLength ?? 0) && 'ts-count-full')} aria-live="polite">
          {count}
        </span>
      )}
    </Field>
  );
});

/* ---------- Slider ---------- */

export interface SliderProps {
  label: ReactNode;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Formats the shown value and the screen-reader value text, e.g. (v) => `${v}%`. */
  format?: (value: number) => string;
  /** Labelled ticks under the track. */
  marks?: Array<{ value: number; label?: ReactNode }>;
  hint?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

/** Picks a number from a range by dragging. A native range input underneath, so keyboard and touch just work. */
export function Slider({ label, value: valueProp, defaultValue, onChange, min = 0, max = 100, step = 1, format = String, marks, hint, disabled, name, id: idProp, className }: SliderProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [value, setValue] = useControllable(valueProp, defaultValue ?? min, onChange);
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <Field
      id={id}
      label={
        label && (
          <span className="ts-slider-head">
            <span>{label}</span>
            <output htmlFor={id} className="ts-slider-value">
              {format(value)}
            </output>
          </span>
        )
      }
      hint={hint}
      className={className}
    >
      <div className={cx('ts-slider', disabled && 'ts-slider-disabled')} style={{ '--pct': `${pct}%` } as CSSProperties}>
        <input
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-valuetext={format(value)}
          {...describedBy(id, hint)}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(Number(e.target.value))}
        />
      </div>
      {marks && (
        <div className="ts-slider-marks" aria-hidden="true">
          {marks.map((m) => (
            <span key={m.value} style={{ left: `${((m.value - min) / (max - min)) * 100}%` }} className={m.value <= value ? 'ts-mark-on' : undefined}>
              {m.label ?? m.value}
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

/* ---------- SegmentedControl ---------- */

export interface SegmentedControlProps {
  /** Accessible name for the group. */
  label: string;
  options: Array<string | { value: string; label: ReactNode; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  /** Stretch to fill the container. */
  block?: boolean;
  name?: string;
  className?: string;
}

/** A row of mutually exclusive options that switch a view or mode immediately. */
export function SegmentedControl({ label, options, value: valueProp, defaultValue, onChange, size = 'md', block, name: nameProp, className }: SegmentedControlProps) {
  const auto = useId();
  const name = nameProp ?? auto;
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const [value, setValue] = useControllable(valueProp, defaultValue ?? opts[0]?.value ?? '', onChange);
  const root = useRef<HTMLDivElement>(null);
  const [ink, setInk] = useState<{ x: number; w: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = root.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(value)}"]`);
      if (el) setInk({ x: el.offsetLeft, w: el.offsetWidth });
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && root.current) ro.observe(root.current);
    document.fonts?.ready.then(measure);
    return () => ro?.disconnect();
  }, [value, options.length]);

  return (
    <div ref={root} role="radiogroup" aria-label={label} className={cx('ts-segctl', `ts-segctl-${size}`, block && 'ts-segctl-block', className)}>
      {ink && <span className="ts-segctl-ink" aria-hidden="true" style={{ width: ink.w, transform: `translateX(${ink.x}px)` }} />}
      {opts.map((o) => (
        <label key={o.value} className={cx('ts-segctl-item', o.value === value && 'ts-segctl-on', o.disabled && 'ts-segctl-disabled')} data-value={o.value}>
          <input type="radio" name={name} value={o.value} checked={o.value === value} disabled={o.disabled} onChange={() => setValue(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

/* ---------- NumberInput ---------- */

export interface NumberInputProps {
  label: ReactNode;
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shown after the number, e.g. "years". */
  suffix?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const clampTo = (v: number, min?: number, max?: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));
const roundTo = (v: number, step: number) => {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number(v.toFixed(decimals));
};

/** A number field with step buttons. Arrow keys step, Shift steps by 10, the value clamps on blur. */
export function NumberInput({ label, value: valueProp, defaultValue = null, onChange, min, max, step = 1, suffix, hint, error, disabled, name, id: idProp, className }: NumberInputProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [value, setValue] = useControllable<number | null>(valueProp, defaultValue, onChange);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value == null ? '' : String(value));

  const commit = (next: number | null) => {
    setDraft(null);
    setValue(next == null || Number.isNaN(next) ? null : roundTo(clampTo(next, min, max), step));
  };
  const bump = (dir: 1 | -1, big = false) => commit((value ?? min ?? 0) + dir * step * (big ? 10 : 1));

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      bump(e.key === 'ArrowUp' ? 1 : -1, e.shiftKey);
    } else if (e.key === 'Home' && min !== undefined) {
      e.preventDefault();
      commit(min);
    } else if (e.key === 'End' && max !== undefined) {
      e.preventDefault();
      commit(max);
    } else if (e.key === 'Enter') {
      commit(shown === '' ? null : Number(shown));
    }
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={cx('ts-number', disabled && 'ts-number-disabled')}>
        <button type="button" className="ts-number-btn" tabIndex={-1} aria-label="Decrease" disabled={disabled || (min !== undefined && (value ?? min) <= min)} onClick={() => bump(-1)}>
          <svg viewBox="0 0 24 24" className="ts-icon" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M6 12h12" />
          </svg>
        </button>
        <input
          id={id}
          name={name}
          className="ts-input ts-number-input"
          inputMode="decimal"
          role="spinbutton"
          autoComplete="off"
          aria-valuenow={value ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          disabled={disabled}
          value={shown}
          {...describedBy(id, hint, error)}
          onChange={(e) => /^-?\d*\.?\d*$/.test(e.target.value) && setDraft(e.target.value)}
          onBlur={() => draft !== null && commit(draft === '' || draft === '-' ? null : Number(draft))}
          onKeyDown={onKeyDown}
        />
        {suffix && <span className="ts-number-suffix">{suffix}</span>}
        <button type="button" className="ts-number-btn" tabIndex={-1} aria-label="Increase" disabled={disabled || (max !== undefined && (value ?? -Infinity) >= max)} onClick={() => bump(1)}>
          <Icon name="plus" />
        </button>
      </div>
    </Field>
  );
}

/* ---------- TagInput ---------- */

export interface TagInputProps {
  label: ReactNode;
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  /** Maximum number of tags. */
  max?: number;
  /** Return an error message to reject a tag, or nothing to accept it. */
  validate?: (tag: string, tags: string[]) => string | undefined;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

/** Free-form tags: type and press Enter or comma; Backspace removes the last one. */
export function TagInput({ label, value: valueProp, defaultValue = [], onChange, placeholder = 'Type and press Enter', max, validate, hint, error, disabled, name, id: idProp, className }: TagInputProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [tags, setTags] = useControllable(valueProp, defaultValue, onChange);
  const [draft, setDraft] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const full = max !== undefined && tags.length >= max;

  function add(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return setProblem(`“${tag}” is already added.`);
    if (full) return setProblem(`You can add up to ${max}.`);
    const msg = validate?.(tag, tags);
    if (msg) return setProblem(msg);
    setProblem(null);
    setTags([...tags, tag]);
    setDraft('');
  }

  function remove(i: number) {
    setTags(tags.filter((_, j) => j !== i));
    input.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      remove(tags.length - 1);
    }
  }

  return (
    <Field id={id} label={label} hint={problem ? undefined : hint} error={problem ?? error} className={className}>
      <div className={cx('ts-tags', disabled && 'ts-tags-disabled')} onClick={() => input.current?.focus()}>
        <ul className="ts-tag-list" aria-label="Added">
          {tags.map((t, i) => (
            <li key={t} className="ts-tag">
              <span>{t}</span>
              <button type="button" className="ts-tag-x" aria-label={`Remove ${t}`} disabled={disabled} onClick={(e) => (e.stopPropagation(), remove(i))}>
                <Icon name="x" />
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={input}
          id={id}
          className="ts-tags-input"
          value={draft}
          disabled={disabled || full}
          placeholder={full ? `${max} of ${max} added` : tags.length ? '' : placeholder}
          {...describedBy(id, hint, problem ?? error)}
          onChange={(e) => {
            setProblem(null);
            if (e.target.value.endsWith(',')) add(e.target.value.slice(0, -1));
            else setDraft(e.target.value);
          }}
          onBlur={() => draft && add(draft)}
          onKeyDown={onKeyDown}
        />
      </div>
      {name && tags.map((t) => <input key={t} type="hidden" name={name} value={t} />)}
    </Field>
  );
}

/* ---------- FileDropzone ---------- */

export interface FileDropzoneProps {
  label: ReactNode;
  /** Same as the input's `accept`, e.g. ".pdf,.docx" or "image/*". */
  accept?: string;
  multiple?: boolean;
  /** Bytes. */
  maxSize?: number;
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Called with files that were turned away and why. */
  onReject?: (rejected: Array<{ file: File; reason: string }>) => void;
  hint?: ReactNode;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

export const formatBytes = (n: number) => (n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB` : `${(n / 1048576).toFixed(1)} MB`);

/** Whether `file` matches an `accept` string like ".pdf,image/*". */
export function acceptsFile(file: { name: string; type: string }, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(',').some((rule) => {
    const r = rule.trim().toLowerCase();
    if (!r) return false;
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r);
    if (r.endsWith('/*')) return file.type.toLowerCase().startsWith(r.slice(0, -1));
    return file.type.toLowerCase() === r;
  });
}

/** Drag files in or click to browse. Lists what was added; turns away the wrong type or size with a reason. */
export function FileDropzone({ label, accept, multiple, maxSize, files: filesProp, defaultFiles = [], onFilesChange, onReject, hint, disabled, name, id: idProp, className }: FileDropzoneProps) {
  const auto = useId();
  const id = idProp ?? auto;
  const [files, setFiles] = useControllable(filesProp, defaultFiles, onFilesChange);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  function take(list: FileList | File[]) {
    const incoming = Array.from(list);
    const rejected: Array<{ file: File; reason: string }> = [];
    const ok = incoming.filter((f) => {
      if (!acceptsFile(f, accept)) rejected.push({ file: f, reason: `${f.name} isn’t an accepted file type.` });
      else if (maxSize && f.size > maxSize) rejected.push({ file: f, reason: `${f.name} is over ${formatBytes(maxSize)}.` });
      else return true;
      return false;
    });
    setProblem(rejected.length ? rejected.map((r) => r.reason).join(' ') : null);
    if (rejected.length) onReject?.(rejected);
    if (ok.length) setFiles(multiple ? [...files, ...ok] : ok.slice(0, 1));
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    if (!disabled) take(e.dataTransfer.files);
  };

  return (
    <Field id={id} label={label} error={problem} hint={problem ? undefined : hint} className={className}>
      <label
        htmlFor={id}
        className={cx('ts-drop', over && 'ts-drop-over', disabled && 'ts-drop-disabled')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        <span className="ts-drop-icon" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="ts-drop-text">
          <b>{over ? 'Drop to add' : 'Drop files here or browse'}</b>
          <span>
            {[accept && accept.split(',').map((a) => a.trim().replace(/^\./, '').toUpperCase()).join(', '), maxSize && `up to ${formatBytes(maxSize)}`].filter(Boolean).join(' · ') || (multiple ? 'Any number of files' : 'One file')}
          </span>
        </span>
        <input
          ref={input}
          id={id}
          name={name}
          type="file"
          className="ts-sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          {...describedBy(id, hint, problem)}
          onChange={(e) => {
            if (e.target.files) take(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="ts-files">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="ts-file">
              <Icon name="file" />
              <span className="ts-file-name">{f.name}</span>
              <span className="ts-file-size">{formatBytes(f.size)}</span>
              <button type="button" className="ts-close ts-focus" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                <Icon name="x" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Field>
  );
}
