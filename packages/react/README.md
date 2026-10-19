# @tessera-design/react

React components for **Tessera**, a tile-built design system: 40 typed, accessible components, four themes in light and dark, and motion that lands with a small bounce.

**[Docs and live examples](https://jwag789.github.io/tessera/)** · [Themes](https://jwag789.github.io/tessera/#themes) · [Folio, an app built with it](https://jwag789.github.io/tessera/folio/) · [Source](https://github.com/jwag789/tessera)

## Install

```bash
npm install @tessera-design/react
```

React 18.2 or newer is a peer dependency. `@tessera-design/tokens` comes along as a dependency.

## Use

```tsx
import '@tessera-design/react/styles.css'; // design tokens + component styles, one file
import '@tessera-design/react/fonts.css';  // optional: Bricolage Grotesque, Instrument Sans, JetBrains Mono from Google Fonts
import { Button, Card, ThemeProvider, ToastProvider } from '@tessera-design/react';

export function App() {
  return (
    <ThemeProvider storageKey="theme">
      <ToastProvider>
        <Card variant="tile" eyebrow="Most picked" title="Grid" actions={<Button>Use template</Button>}>
          A two-column layout with a skills sidebar.
        </Card>
      </ToastProvider>
    </ThemeProvider>
  );
}
```

The bundle is ESM and CommonJS with TypeScript types, and starts with `"use client"`, so it works in the Next.js App Router.

## Themes

Each theme works in light and dark mode. Load a theme's CSS, then pick it with `ThemeProvider`:

```tsx
import '@tessera-design/react/themes/cartridge.css';
import '@tessera-design/react/themes/cartridge-fonts.css';

<ThemeProvider defaultBrand="cartridge" storageKey="theme">…</ThemeProvider>
```

| Theme | Files |
| --- | --- |
| Tessera (default) | nothing extra |
| Cartridge | `themes/cartridge.css`, `themes/cartridge-fonts.css` |
| Polygon | `themes/polygon.css`, `themes/polygon-fonts.css` |
| Gloop | `themes/gloop.css`, `themes/gloop-fonts.css` |
| Shonen | `themes/shonen.css`, `themes/shonen-fonts.css` |
| Jelly | `themes/jelly.css`, `themes/jelly-fonts.css` |
| Neon | `themes/neon.css`, `themes/neon-fonts.css` |
| Static | `themes/static.css`, `themes/static-fonts.css` |
| Clay | `themes/clay.css`, `themes/clay-fonts.css` |

Dark mode follows the system unless the user picks one; `useTheme()` reads and changes both the mode and the theme.

## Components

Button, DropdownMenu, CommandPalette · TextField, Textarea, Select, Combobox, DatePicker, Calendar, NumberInput, Slider, SegmentedControl, TagInput, FileDropzone, Checkbox, RadioGroup, Switch · Navbar, SidebarNav, Tabs, Breadcrumbs, Pagination, Stepper · Stack, Inline, Grid, Container, Divider, Card, Accordion · Table · Badge, Avatar, Kbd · Alert, Toast, Progress, Skeleton, Spinner, EmptyState · Dialog, Drawer, Popover, Tooltip · ThemeProvider · Mosaic, Icon

Every component has a live example, usage guidelines and a props table in the [docs](https://jwag789.github.io/tessera/), and runs through axe accessibility checks in the test suite.

## License

MIT
