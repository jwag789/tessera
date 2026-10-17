# ThemeProvider

Light, dark or system theme, remembered between visits, with optional token overrides. Read and change it anywhere with `useTheme()`.

**Consumer provides:** optional `theme` + `onThemeChange` or `defaultTheme` (default `system`), `storageKey` to remember the choice in localStorage, `tokens` to override values (`{ lapis: '#0f766e' }`, or `{ light: {...}, dark: {...} }`), and `scope`.

- `scope="document"` (default) sets `data-theme` on `<html>`, so menus, dialogs and toasts rendered in portals match.
- `scope="local"` themes one subtree, like a dark hero on a light page. Portaled layers it opens use the page theme.
- `useTheme()` returns `{ theme, resolvedTheme, setTheme }`. `resolvedTheme` is what's showing, with `system` resolved and kept in sync with the OS.
- Without a provider, the CSS still follows the system setting; `useTheme()` just can't change it.
