# Tessera

A bold, tile-built design system and React component library. Tight corners, a 4px grid, lapis blue with one saffron tile out of place, and motion that lands with a small bounce.

- **28 React components**, typed, tested and keyboard-accessible: from Button and Select to Command palette, Date picker and Navbar.
- **Design tokens** for color (light and dark), type, space, radius, shadow and motion, as CSS variables and as data.
- **A docs site** with a live example and guidelines for every component.

## Packages

| Package | What it is |
| --- | --- |
| [`@tessera/tokens`](packages/tokens) | `tokens.json` built into `tokens.css` (CSS variables for both themes plus type classes) and a typed JS export |
| [`@tessera/react`](packages/react) | The components, one stylesheet, and the shared positioning layer |
| [`apps/docs`](apps/docs) | The documentation site (Vite + React), built from the component source |

## Use it

```bash
npm install @tessera/react @tessera/tokens
```

> Not published to npm yet. Until it is, run `npm run build:packages` here and install `packages/react` and `packages/tokens` by path.

```tsx
import '@tessera/react/styles.css'; // tokens + component styles
import '@tessera/react/fonts.css';  // optional: Bricolage Grotesque, Instrument Sans, JetBrains Mono
import { Button, Card, ToastProvider } from '@tessera/react';

export function App() {
  return (
    <ToastProvider>
      <Card variant="tile" eyebrow="Most picked" title="Grid" actions={<Button>Use template</Button>}>
        A two-column layout with a skills sidebar.
      </Card>
    </ToastProvider>
  );
}
```

Dark mode follows the system setting; set `data-theme="dark"` or `"light"` on `<html>` to force one.

## Components

| Group | Components |
| --- | --- |
| Actions | Button, DropdownMenu, CommandPalette (+ `useHotkey`) |
| Forms | TextField, Select, Combobox, DatePicker (+ Calendar), Checkbox, RadioGroup, Switch |
| Navigation | Navbar, SidebarNav, Tabs, Breadcrumbs, Pagination |
| Layout | Card, Accordion |
| Data | Table |
| Status | Badge, Avatar (+ AvatarGroup) |
| Feedback | Alert, Toast (+ ToastProvider, `useToast`), Progress, Skeleton |
| Overlays | Dialog, Popover (+ Floating), Tooltip |
| Brand | Mosaic, Icon |

Popover, DropdownMenu, DatePicker and Tooltip share one positioning layer (`Floating`): portal, flip when there's no room, shift to stay on screen, follow scroll and resize, and animate in from the side they open on.

## Develop

```bash
npm install
npm run dev        # docs at http://localhost:5174, live against the component source
npm test           # component and logic tests (Vitest + Testing Library)
npm run typecheck
npm run build      # tokens, then the React package, then the docs
```

Tokens live in `packages/tokens/tokens.json`; edit them there and rebuild. Component styles are in `packages/react/src/styles.css` and use only token variables. Each component's guidelines are in `apps/docs/src/content/<Component>.md`, and its live example and usage snippet are in `apps/docs/src/demos.tsx`.

## Deploy the docs

`.github/workflows/docs.yml` builds the docs and publishes them to GitHub Pages on every push to `main`. Turn on Pages with "GitHub Actions" as the source in the repository settings. `ci.yml` runs typecheck, tests and the build on every push and pull request.

## License

MIT
