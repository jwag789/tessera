import { forwardRef } from 'react';
import type { CSSProperties, ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../utils';

/** Steps on the 4px grid, matching the `space-*` tokens. */
export type Space = 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 24;

/** `var(--space-N)` for a spacing step. */
export const space = (step: Space | undefined) => (step === undefined ? undefined : step === 0 ? '0' : `var(--space-${String(step).replace('.', '-')})`);

type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
const flexAlign = (a?: Align) => (a === 'start' ? 'flex-start' : a === 'end' ? 'flex-end' : a);
const flexJustify = (j?: Justify) => (j === 'start' ? 'flex-start' : j === 'end' ? 'flex-end' : j === 'between' ? 'space-between' : j === 'around' ? 'space-around' : j === 'evenly' ? 'space-evenly' : j);

interface BoxProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Default `div`. */
  as?: ElementType;
  /** Padding on all sides, in spacing steps. */
  padding?: Space;
  children?: ReactNode;
}

export interface StackProps extends BoxProps {
  /** Space between children. Default 4 (16px). */
  gap?: Space;
  align?: Align;
  justify?: Justify;
}

/** Children in a column with even spacing. The default building block for vertical rhythm. */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack({ as: As = 'div', gap = 4, align, justify, padding, className, style, ...rest }, ref) {
  return (
    <As
      ref={ref}
      {...rest}
      className={cx('ts-stack', className)}
      style={{ gap: space(gap), alignItems: flexAlign(align), justifyContent: flexJustify(justify), padding: space(padding), ...style } as CSSProperties}
    />
  );
});

export interface InlineProps extends BoxProps {
  /** Space between children. Default 3 (12px). */
  gap?: Space;
  /** Separate row gap when wrapping. */
  rowGap?: Space;
  align?: Align;
  justify?: Justify;
  /** Wrap onto new lines. Default true. */
  wrap?: boolean;
}

/** Children in a row that wraps: button groups, tags, toolbars. */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline({ as: As = 'div', gap = 3, rowGap, align = 'center', justify, wrap = true, padding, className, style, ...rest }, ref) {
  return (
    <As
      ref={ref}
      {...rest}
      className={cx('ts-inline', className)}
      style={{ columnGap: space(gap), rowGap: space(rowGap ?? gap), alignItems: flexAlign(align), justifyContent: flexJustify(justify), flexWrap: wrap ? 'wrap' : 'nowrap', padding: space(padding), ...style } as CSSProperties}
    />
  );
});

export interface GridProps extends BoxProps {
  /** A fixed number of equal columns. */
  columns?: number;
  /** Responsive: as many columns as fit at this minimum width (px). Wins over `columns`. */
  minChildWidth?: number;
  /** Default 6 (24px). */
  gap?: Space;
}

/** Equal-width columns; with `minChildWidth` it reflows by itself from phone to desktop. */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid({ as: As = 'div', columns = 2, minChildWidth, gap = 6, padding, className, style, ...rest }, ref) {
  const template = minChildWidth ? `repeat(auto-fill, minmax(min(100%, ${minChildWidth}px), 1fr))` : `repeat(${columns}, minmax(0, 1fr))`;
  return <As ref={ref} {...rest} className={cx('ts-grid', className)} style={{ gridTemplateColumns: template, gap: space(gap), padding: space(padding), ...style } as CSSProperties} />;
});

export interface ContainerProps extends BoxProps {
  /** Max width: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1200 (default) · `full`. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** Centers content at a readable max width with the page gutter on both sides. */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container({ as: As = 'div', size = 'xl', className, ...rest }, ref) {
  return <As ref={ref} {...rest} className={cx('ts-container', `ts-container-${size}`, className)} />;
});

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  /** Text in the middle of a horizontal divider, e.g. "or". */
  label?: ReactNode;
  className?: string;
}

/** A hairline between groups of content. */
export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (label && orientation === 'horizontal')
    return (
      <div className={cx('ts-divider-label', className)} role="separator" aria-orientation="horizontal">
        <span>{label}</span>
      </div>
    );
  return <hr className={cx('ts-divider', orientation === 'vertical' && 'ts-divider-v', className)} aria-orientation={orientation} />;
}
