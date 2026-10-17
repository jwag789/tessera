# Tessera

A bold, tile-built design system and React component library. Tight corners, a 4px grid, lapis blue with one saffron tile out of place, and motion that lands with a small bounce.

- **40+ React components**, typed, tested and keyboard-accessible: from Button and Select to Command palette, Date picker, Data table and Drawer, plus layout primitives.
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

### Themes

Tessera ships four themes, each in light and dark: **Tessera** (the default), **Cartridge** (charcoal plastic with light labels, four button colors, chunky keys that press down) and **Polygon** (matte grey plastic, dark recessed panels, hard bevels and pixel headings) and **Gloop** (90s kids-TV: slime green and orange, thick outlines, everything a bit tilted). Import a theme's CSS and pick it with `ThemeProvider`:

```tsx
import '@tessera/react/themes/cartridge.css';
import '@tessera/react/themes/cartridge-fonts.css';

<ThemeProvider defaultBrand="cartridge" storageKey="theme"><App /></ThemeProvider>
```

A theme is a token file in `packages/tokens/themes/` plus optional component treatments in `packages/react/src/themes/`, built into one CSS file scoped to `[data-brand="name"]`.

Dark mode follows the system setting. Wrap the app in `<ThemeProvider storageKey="theme">` to let people choose and remember it, override tokens (`tokens={{ lapis: '#0f766e' }}`), or theme one subtree with `scope="local"`. Without React, set `data-theme="dark"` or `"light"` on any element.

`apps/resume` is **Folio**, a resume builder and job tracker built on the library, with every theme: it tailors your resume to every job and remembers exactly what you sent. Run it with `npm run dev:resume`; it is published with the docs at `/tessera/folio/`. Sign-in and server saving use a free Supabase project, see [apps/resume/SETUP.md](apps/resume/SETUP.md).

The bundle starts with `"use client"`, so it works from React Server Components in the Next.js App Router.

## Components

| Group | Components |
| --- | --- |
| Actions | Button, DropdownMenu, CommandPalette (+ `useHotkey`) |
| Forms | TextField, Textarea, Select, Combobox, DatePicker (+ Calendar), NumberInput, Slider, SegmentedControl, TagInput, FileDropzone, Checkbox, RadioGroup, Switch |
| Navigation | Navbar, SidebarNav, Tabs, Breadcrumbs, Pagination, Stepper |
| Layout | Stack, Inline, Grid, Container, Divider, Card, Accordion |
| Data | Table (sorting, selection, sticky header) |
| Status | Badge, Avatar (+ AvatarGroup), Kbd |
| Feedback | Alert, Toast (+ ToastProvider, `useToast`), Progress, Skeleton, Spinner, EmptyState |
| Overlays | Dialog, Drawer, Popover (+ Floating), Tooltip |
| Theming | ThemeProvider (+ `useTheme`), themes: Tessera, Cartridge, Polygon, Gloop |
| Brand | Mosaic, Icon |

Popover, DropdownMenu, DatePicker and Tooltip share one positioning layer (`Floating`): portal, flip when there's no room, shift to stay on screen, follow scroll and resize, and animate in from the side they open on.

## Develop

```bash
npm install
npm run dev        # docs at http://localhost:5174, live against the component source
npm test           # behavior tests and axe accessibility checks (Vitest + Testing Library)
npm run typecheck
npm run build      # tokens, then the React package, then the docs
npm run size       # gzipped bundle size against the budget in packages/react/package.json
```

Tokens live in `packages/tokens/tokens.json`; edit them there and rebuild. Component styles are in `packages/react/src/styles.css` and use only token variables. Each component's guidelines are in `apps/docs/src/content/<Component>.md`, and its live example and usage snippet are in `apps/docs/src/demos.tsx`. The props tables are generated from the TypeScript types (`apps/docs/scripts/gen-props.mjs`), so documenting a prop means writing a `/** comment */` on it.

### Quality gates

- **Accessibility:** every component runs through axe-core in `packages/react/test/a11y.test.tsx`. Keyboard behavior (menus, comboboxes, the date grid, focus traps) is covered by the behavior tests.
- **Bundle size:** CI fails if the gzipped JS or CSS grows past its budget.
- **Types:** strict TypeScript across packages and docs.

### Releasing

Changes to the packages get a changeset: run `npx changeset`, choose the bump and write one changelog line. `npx changeset version` applies pending changesets to versions and CHANGELOGs; `npx changeset publish` publishes. `@tessera/tokens` and `@tessera/react` always release together.

## Deploy the docs

`.github/workflows/docs.yml` builds the docs and publishes them to GitHub Pages on every push to `main`. Turn on Pages with "GitHub Actions" as the source in the repository settings. `ci.yml` runs typecheck, tests and the build on every push and pull request.

## License

MIT
