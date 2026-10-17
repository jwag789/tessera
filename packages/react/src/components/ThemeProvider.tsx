import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** What was chosen: light, dark or system. */
  theme: ThemeMode;
  /** What is showing right now. */
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function systemPrefersDark() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function readStored(key: string | undefined): ThemeMode | null {
  if (!key || typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(key);
    return v === 'light' || v === 'dark' || v === 'system' ? v : null;
  } catch {
    return null;
  }
}

export interface ThemeProviderProps {
  children?: ReactNode;
  /** Controlled theme. */
  theme?: ThemeMode;
  /** Starting theme when uncontrolled. Default `system`. */
  defaultTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  /** Remember the choice in localStorage under this key. Off by default. */
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

/** Light, dark or system theme for Tessera, with optional token overrides. Read and change it with `useTheme()`. */
export function ThemeProvider({ children, theme: themeProp, defaultTheme = 'system', onThemeChange, storageKey, tokens, scope = 'document', className }: ThemeProviderProps) {
  const [inner, setInner] = useState<ThemeMode>(() => readStored(storageKey) ?? defaultTheme);
  const theme = themeProp ?? inner;
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
    const applied = Object.entries(vars as Record<string, string>);
    applied.forEach(([k, v]) => root.style.setProperty(k, v));
    return () => applied.forEach(([k]) => root.style.removeProperty(k));
  }, [theme, scope, varsKey]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      if (themeProp === undefined) setInner(next);
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          /* storage unavailable: the choice lasts for this visit */
        }
      }
      changeRef.current?.(next);
    },
    [themeProp, storageKey]
  );

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {scope === 'local' ? (
        <div className={className} data-theme={resolvedTheme} style={{ ...vars, color: 'var(--ink)', background: 'var(--bg)' }}>
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
  return ctx ?? { theme: 'system', resolvedTheme: systemDark ? 'dark' : 'light', setTheme: () => {} };
}
