# @tessera/react

## 0.2.0

### Minor Changes

- b7e8348: `Calendar` takes `isMarked(date)` to put a dot on days that have something on them, like interviews on a schedule. Return a short description ("Interview") and it's added to that day's accessible name; return `true` for a generic "has something scheduled".
- 8e0332e: Cartridge reworked to read as its own theme. A charcoal plastic shell is the ground in both modes, with light label surfaces on top (cards, inputs, menus, dialogs and secondary keys re-declare the palette, so text stays AA on both). Green is the primary color, and green, red, blue and yellow show up across buttons, navbar stripe, tabs, sidebar sections, segmented controls, avatars and featured cards. Lilita One headings are bigger. Add `data-surface="label"` to make your own panel a label. Theme CSS now re-declares the full base token set and resets tokens that only other themes define, so a theme nested inside another no longer inherits its fonts or colors.
- 5c950ee: `Combobox` takes `allowCustom` to accept text that isn't one of its options, for fields like a company name where the list is only suggestions. Typed text that matches nothing shows a "Use “…”" row first, and leaving the field keeps it as the value (`onChange(text, null)`); an exact match still resolves to the real option.
- 2c26aaa: New Gloop theme, replacing Soft (which never shipped in a release): 90s kids-TV energy with slime-green primary keys, orange, and a splash of blue and purple, cream in light mode and cartoon navy in dark, thick black outlines, offset shadows in a clashing color, blob-shaped badges and orange tile keys, a slime drip under the navbar, a squiggle under the selected tab, cards tilted a little either way, and Luckiest Guy lettering over Fredoka. Keys squash when pressed, cards wobble and toasts bounce in, all off under reduced motion. Import `@tessera/react/themes/gloop.css` and `@tessera/react/themes/gloop-fonts.css`, then set `brand="gloop"`. Theme builds now clear old output, so removed themes don't linger in `dist/themes`.
- 75f0285: New Polygon theme: matte cool-grey plastic with dark recessed panels, hard 1-2px bevels instead of soft shadows, a green, red, blue and pink accent set for status and selection, a menu cursor on the selected item, Silkscreen pixel headings with Space Mono labels, and faint dither and scanlines on large surfaces. Import `@tessera/react/themes/polygon.css` and `@tessera/react/themes/polygon-fonts.css`, then set `brand="polygon"`.
- afcab8e: Round out the library: Textarea, Slider, SegmentedControl, NumberInput, TagInput, FileDropzone, Drawer, Stepper, EmptyState, Spinner, Kbd and the Stack/Inline/Grid/Container/Divider layout primitives; sortable, selectable Table with a sticky header; ThemeProvider and useTheme with token overrides and subtree theming; a "use client" banner for React Server Components; axe accessibility checks for every component. Tokens now apply on any `[data-theme]` element, not only `<html>`.
- 4d7bd66: Theme packs. Themes are a separate axis from light/dark mode, set with `data-brand` or `ThemeProvider`'s new `brand`/`defaultBrand`/`onBrandChange` (also on `useTheme()`). Ships Cartridge (late-90s console palette, rounded chunky keys that press down, Lilita One and Nunito). Import `@tessera/react/themes/<name>.css`; token-only versions are at `@tessera/tokens/themes/<name>.css`, and `themes` lists them with labels and descriptions. Theme treatments are wrapped in `@scope`, so nested areas with a different theme keep their own look, and base tokens now also apply under `data-brand="tessera"`.

### Patch Changes

- 47fdad4: Fixes found building Folio:
  - Segmented `Progress` no longer highlights a "current" tile once every step is done.
  - A horizontal `Stepper` in a narrow container (a drawer, a card) stacks each label under its marker instead of truncating it.
  - Cartridge and Polygon surfaces set their text color, so text that inherits it (a drawer title, plain copy in a card) follows the surface palette instead of the page's.
- 3c7bb0a: Fix an endless re-render in Tabs that froze the page when a Tabs mounted after web fonts had loaded (for example, on client-side navigation). SegmentedControl gets the same guard.
- da0de90: `RadioGroup` now shows an option's `description` as a muted second line under its label. Options already accepted `description` (they share Select's option type) but it wasn't rendered.
- Updated dependencies [8e0332e]
- Updated dependencies [2c26aaa]
- Updated dependencies [75f0285]
- Updated dependencies [afcab8e]
- Updated dependencies [4d7bd66]
  - @tessera/tokens@0.2.0
