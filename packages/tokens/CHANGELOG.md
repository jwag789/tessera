# @tessera-design/tokens

## 0.3.0

### Minor Changes

- 7f5384f: Two new themes.

  **Shonen** is a manga page: black ink on newsprint with one red spot color, and in dark mode the same page inverted, white ink on black. Screentone stands in for greys; cards are comic panels with heavy borders and no drop shadow; tooltips and toasts are speech bubbles with tails; popovers and menus are narration boxes; dialogs land on focus lines over a page drained to black and white. The big key rumbles ゴゴゴ on hover and hits ドン! when pressed, progress is ink with speed lines, and the tab marker is a red brush stroke. Bangers lettering over Zen Kaku Gothic New, with Dela Gothic One for sound effects. Import `@tessera-design/react/themes/shonen.css` and `themes/shonen-fonts.css`, then set `brand="shonen"`.

  **Jelly** is Y2K candy plastic. Surfaces are see-through and glossy, tinted in iMac flavors over a bubbly, pinstriped ground; keys are gel pills that squash when pressed and spring back; fields and toasts are Tamagotchi LCD screens in a dot-matrix face; avatars are eggs; progress is a heart meter. Dark mode is the same toy in smoked plastic with a backlit green LCD. Comfortaa over Quicksand, with DotGothic16 on the LCD. Import `@tessera-design/react/themes/jelly.css` and `themes/jelly-fonts.css`, then set `brand="jelly"`.

  Motion in both is off under reduced motion.

## 0.2.1

### Patch Changes

- Republish under a new version: `@tessera-design/tokens` 0.2.0 was held in npm's staging during the first release and never went live, so 0.2.1 is the first complete release of both packages. No code changes.

## 0.2.0

### Minor Changes

- 8e0332e: Cartridge reworked to read as its own theme. A charcoal plastic shell is the ground in both modes, with light label surfaces on top (cards, inputs, menus, dialogs and secondary keys re-declare the palette, so text stays AA on both). Green is the primary color, and green, red, blue and yellow show up across buttons, navbar stripe, tabs, sidebar sections, segmented controls, avatars and featured cards. Lilita One headings are bigger. Add `data-surface="label"` to make your own panel a label. Theme CSS now re-declares the full base token set and resets tokens that only other themes define, so a theme nested inside another no longer inherits its fonts or colors.
- 2c26aaa: New Gloop theme, replacing Soft (which never shipped in a release): 90s kids-TV energy with slime-green primary keys, orange, and a splash of blue and purple, cream in light mode and cartoon navy in dark, thick black outlines, offset shadows in a clashing color, blob-shaped badges and orange tile keys, a slime drip under the navbar, a squiggle under the selected tab, cards tilted a little either way, and Luckiest Guy lettering over Fredoka. Keys squash when pressed, cards wobble and toasts bounce in, all off under reduced motion. Import `@tessera-design/react/themes/gloop.css` and `@tessera-design/react/themes/gloop-fonts.css`, then set `brand="gloop"`. Theme builds now clear old output, so removed themes don't linger in `dist/themes`.
- 75f0285: New Polygon theme: matte cool-grey plastic with dark recessed panels, hard 1-2px bevels instead of soft shadows, a green, red, blue and pink accent set for status and selection, a menu cursor on the selected item, Silkscreen pixel headings with Space Mono labels, and faint dither and scanlines on large surfaces. Import `@tessera-design/react/themes/polygon.css` and `@tessera-design/react/themes/polygon-fonts.css`, then set `brand="polygon"`.
- afcab8e: Round out the library: Textarea, Slider, SegmentedControl, NumberInput, TagInput, FileDropzone, Drawer, Stepper, EmptyState, Spinner, Kbd and the Stack/Inline/Grid/Container/Divider layout primitives; sortable, selectable Table with a sticky header; ThemeProvider and useTheme with token overrides and subtree theming; a "use client" banner for React Server Components; axe accessibility checks for every component. Tokens now apply on any `[data-theme]` element, not only `<html>`.
- 4d7bd66: Theme packs. Themes are a separate axis from light/dark mode, set with `data-brand` or `ThemeProvider`'s new `brand`/`defaultBrand`/`onBrandChange` (also on `useTheme()`). Ships Cartridge (late-90s console palette, rounded chunky keys that press down, Lilita One and Nunito). Import `@tessera-design/react/themes/<name>.css`; token-only versions are at `@tessera-design/tokens/themes/<name>.css`, and `themes` lists them with labels and descriptions. Theme treatments are wrapped in `@scope`, so nested areas with a different theme keep their own look, and base tokens now also apply under `data-brand="tessera"`.
