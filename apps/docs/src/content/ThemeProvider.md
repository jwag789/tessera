# ThemeProvider

Light, dark or system mode, a theme pack (`brand`), remembered between visits, with optional token overrides. Read and change both anywhere with `useTheme()`.

**Consumer provides:** optional `theme` + `onThemeChange` or `defaultTheme` (default `system`); `brand` + `onBrandChange` or `defaultBrand` (default `tessera`); `storageKey` to remember both in localStorage; `tokens` to override values (`{ lapis: '#0f766e' }`, or `{ light: {...}, dark: {...} }`); and `scope`.

- Mode and theme are separate: every theme has a light and a dark version. `data-theme` holds the mode, `data-brand` the theme.
- Shipped themes: `tessera` (default), `cartridge`, `polygon`, `gloop`, `shonen`, `jelly` and `neon`. Load a theme's CSS before using it: `import '@tessera-design/react/themes/polygon.css'`, plus `themes/<name>-fonts.css` for Cartridge, Polygon, Gloop, Shonen, Jelly and Neon. Tessera itself needs nothing extra. See [Themes](#themes) to compare them.
- Cartridge and Polygon paint surfaces in a different palette from the page (cartridge labels on a charcoal controller, dark panels in grey plastic). Add `data-surface="label"` to your own panel to give it the same treatment.
- `scope="document"` (default) sets both attributes on `<html>`, so menus, dialogs and toasts rendered in portals match.
- `scope="local"` themes one subtree, like the comparison columns on the Themes page. Theme treatments are scoped with CSS `@scope`, so a nested area with a different theme keeps its own look.
- `useTheme()` returns `{ theme, resolvedTheme, setTheme, brand, setBrand }`. `resolvedTheme` is what's showing, with `system` resolved and kept in sync with the OS.
