import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** What was chosen: light, dark or system. */
  theme: ThemeMode;
  /** What is showing right now. */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  /** The theme pack in use, e.g. "tessera", "cartridge", "polygon", "gloop", "shonen", "jelly", "neon", "static", "lagoon", "clay". */
  brand: string;
  setBrand: (brand: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function systemPrefersDark() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function readStored(key: string | undefined): string | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStored(key: string | undefined, value: string) {
  if (!key) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
}
const asMode = (v: string | null): ThemeMode | null => (v === 'light' || v === 'dark' || v === 'system' ? v : null);

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Controlled theme. */
  theme?: ThemeMode;
  /** Starting theme when uncontrolled. Default `system`. */
  defaultTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  /**
   * Theme pack, set as `data-brand`. Load its CSS first: `import '@tessera-design/react/themes/cartridge.css'`.
   * `tessera` (default) is the base look and needs no extra CSS.
   */
  brand?: string;
  defaultBrand?: string;
  onBrandChange?: (brand: string) => void;
  /** Remember the choices in localStorage: the mode under this key, the theme pack under `<key>:brand`. Off by default. */
  storageKey?: string;
  /**
   * Override token values, e.g. `{ lapis: '#0f766e', 'radius-md': '10px' }`. Applies to both themes;
   * pass `{ light: {...}, dark: {...} }` to set them separately.
   */
  tokens?: Record<string, string> | { light?: Record<string, string>; dark?: Record<string, string> };
  /**
   * `document` (default) themes the whole page, so portaled layers (menus, dialogs, toasts) match.
   * `local` themes only this subtree; layers it opens render with the page theme.
   */
  scope?: 'document' | 'local';
  className?: string;
}

const toVars = (t?: Record<string, string>) =>
  Object.fromEntries(Object.entries(t ?? {}).map(([k, v]) => [k.startsWith('--') ? k : `--${k}`, v])) as CSSProperties;

/** Light, dark or system mode, an optional theme pack (`brand`), and token overrides. Read and change them with `useTheme()`. */
export function ThemeProvider({ children, theme: themeProp, defaultTheme = 'system', onThemeChange, brand: brandProp, defaultBrand = 'tessera', onBrandChange, storageKey, tokens, scope = 'document', className }: ThemeProviderProps) {
  const [inner, setInner] = useState<ThemeMode>(() => asMode(readStored(storageKey)) ?? defaultTheme);
  const theme = themeProp ?? inner;
  const [innerBrand, setInnerBrand] = useState<string>(() => readStored(storageKey && `${storageKey}:brand`) ?? defaultBrand);
  const brand = brandProp ?? innerBrand;
  const brandChangeRef = useRef(onBrandChange);
  brandChangeRef.current = onBrandChange;
  const [systemDark, setSystemDark] = useState(systemPrefersDark);
  const changeRef = useRef(onThemeChange);
  changeRef.current = onThemeChange;

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const resolvedTheme: 'light' | 'dark' = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  const split = tokens && ('light' in tokens || 'dark' in tokens) ? (tokens as { light?: Record<string, string>; dark?: Record<string, string> }) : null;
  const vars = split ? toVars(resolvedTheme === 'dark' ? split.dark : split.light) : toVars(tokens as Record<string, string> | undefined);
  const varsKey = JSON.stringify(vars);

  useIsoLayoutEffect(() => {
    if (scope !== 'document') return;
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    if (brand === 'tessera') root.removeAttribute('data-brand');
    else root.setAttribute('data-brand', brand);
    const applied = Object.entries(vars as Record<string, string>);
    applied.forEach(([k, v]) => root.style.setProperty(k, v));
    return () => applied.forEach(([k]) => root.style.removeProperty(k));
  }, [theme, brand, scope, varsKey]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (themeProp === undefined) setInner(next);
      writeStored(storageKey, next);
      changeRef.current?.(next);
    },
    [themeProp, storageKey]
  );

  const setBrand = useCallback(
    (next: string) => {
      if (brandProp === undefined) setInnerBrand(next);
      writeStored(storageKey && `${storageKey}:brand`, next);
      brandChangeRef.current?.(next);
    },
    [brandProp, storageKey]
  );

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, brand, setBrand }), [theme, resolvedTheme, setTheme, brand, setBrand]);

  return (
    <ThemeContext.Provider value={value}>
      {scope === 'local' ? (
        <div className={className} data-theme={resolvedTheme} data-brand={brand} style={{ ...vars, color: 'var(--ink)', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
          {children}
        </div>
      ) : (
        children
      )}
    </ThemeContext.Provider>
  );
}

/** The current theme and a setter. Works without a provider too: then it reads the system setting and can't change it. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  const [systemDark] = useState(systemPrefersDark);
  return ctx ?? { theme: 'system', resolvedTheme: systemDark ? 'dark' : 'light', setTheme: () => {}, brand: 'tessera', setBrand: () => {} };
}
