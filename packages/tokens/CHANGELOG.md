# @tessera-design/tokens

## 0.7.0

### Minor Changes

- af64843: New theme, Cutout: construction paper and scissors, like a cutout cartoon. A sky of blue paper with paper clouds over a row of snowy paper hills, or a navy night with a paper moon and stars after dark, with construction-paper grain laid over the whole page. Everything is cut from paper in flat colors: scissor-cut corners, sheets laid down a little crooked with a hard little shadow, chunky Lilita One titles cut out with a white margin, Mali for body text and Courier Prime for mono. Keys and cards don't glide; they jump a frame at a time, the way cutout animation moves, and pressing pastes them flat. The featured card is yellow paper, badges and tooltips are snipped scraps, avatars are paper circles, the navbar ends in a scissor-cut edge, progress is a red strip glued on in jumps and the spinner is four scraps hopping in turn. Import `@tessera-design/react/themes/cutout.css` and `themes/cutout-fonts.css`, then set `brand="cutout"`.

## 0.6.0

### Minor Changes

- 0c65edc: New theme, Atelier: editorial and quiet, for studios and portfolios. Warm bone paper and near-black ink; titles in a light, high-contrast serif (Fraunces) over Manrope; keys, labels, bar links and badges in small spaced capitals; hairlines instead of shadows, square corners, fields as a single rule, a brochure-style accordion, and one terracotta accent. After dark it's a gallery wall in deep charcoal with ivory type. Import `@tessera-design/react/themes/atelier.css` and `themes/atelier-fonts.css`, then set `brand="atelier"`.

### Patch Changes

- 6d79a2c: Theme descriptions and stylesheet comments describe Neon, Jelly, Static, Clay and Lagoon in plain terms instead of naming the films, games and products that inspired them. Neon's `nn-derez` animation is now `nn-flicker`. No visual changes.
- 3095486: `ToastProvider` no longer causes a hydration mismatch in server-rendered apps such as the Next.js App Router. The toaster now portals into `<body>` after mount instead of branching on `typeof document` during render.

## 0.5.0

### Minor Changes

- e1c7ca2: **Cartridge** goes further than a palette. Every card is a cartridge with the label set into a plastic shell, and interactive ones tip toward you on hover. On its own, the mosaic tips back in perspective into a stage floor of raised blocks, and the page sits on a checkerboard floor that fades into distance fog. Primary, secondary and tile keys carry a round A, B or C prompt; danger is the Start key and rumbles when pressed; focus is a breathing yellow lock-on. Dialogs, popovers, toasts and tooltips are see-through text boxes (toasts wait on a blinking red arrow, dialogs zoom in out of the fog). Progress is a magic meter, the slider thumb is an analog stick, the switch is a power slider, accent badges are coins and avatars are shaded spheres. New `key-a`, `key-b`, `key-c` and `key-start` tokens (with `on-*` pairs) hold the controller colors. Display type is Titan One, so reload `themes/cartridge-fonts.css`.
- e0cba72: A new theme, Clay: playdough and claymation. Every surface is a soft matte lump of modelling clay in toy-box colors (blue, red, yellow, green, purple) on warm putty, or dark plasticine after dark, with a lit clay grain, the odd thumbprint and a few clay balls left lying around the page. Corners are lumpy and hand-rolled; big titles are fat Fredoka molded from clay like the keys (a lit top edge, a shaded belly, grain pressed into the letters, a thick edge underneath); keys are colored lumps and interactive cards are soft slabs, both wobbling on hover, squashing when pressed and springing back; fields, checkboxes, switches and segmented controls are pressed into the clay; the featured card is a yellow slab on a red one; dialogs and toasts plop in; progress is a rolled two-tone clay snake, steps are beads, the spinner is four balls bouncing with squash and stretch. Body type is Figtree, mono is Space Mono. Adds a `clay-purple` token.

  Import `themes/clay.css` and `themes/clay-fonts.css`.

- e0cba72: A new theme, Lagoon: an early-2000s JRPG island. A sunlit beach by day (a big sky with the sun and a few clouds, sand along the foot of the page) and the night tide after dark (the moon, a field of stars, the sea glowing at the foot, fireflies drifting up). Menus, dialogs, popovers, tooltips and toasts are the classic blue gradient window with a white edge in both modes, with a bobbing pointing-glove cursor; titles are Marcellus with a sea-glass sheen; keys are glossy gel and the accent key is a gold sphere; the featured card sits in a gold window frame; avatars are element orbs; progress is an overdrive gauge; the spinner is four orbs in orbit; toasts read like an item-get box; the navbar ends in a wave. Body type is Nunito, mono is DM Mono.

  Import `themes/lagoon.css` and `themes/lagoon-fonts.css`.

## 0.4.0

### Minor Changes

- 357b71a: Cartridge redone as a 90s game console theme instead of a recolor. Primary is the blue A button (domed, white label, presses down), danger is the red Start button, the accent is the yellow C button. Cards are cartridges: the label sits in grey plastic with grip ridges across the top, and the featured card is the gold one. Dialogs, popovers, menus, selects, tooltips and toasts are retro RPG text boxes (dark navy, yellow titles, a blinking green arrow on dialogs, an A-blue menu cursor). Display headings get gold, extruded lettering. Progress is the magic meter, switches are the power slider with a red light, avatars are face buttons and mosaic tiles are shaded cubes. Focus rings are yellow.
- 02eb669: New Neon theme: 80s sci-fi. A black grid world lit in cyan, with an orange rival. Big titles are Orbitron capitals, white-hot with a cyan glow and a slice through the middle; keys, tabs and badges are Orbitron capitals too, over Oxanium. Panels are dark glass with HUD brackets on their corners; the featured card is orange and flickers as it powers on. Light trails run along the navbar and fill the progress bar. Fields, tooltips and toasts are terminals in Share Tech Mono with phosphor-cyan type; dialogs boot from a line of light; avatars are glowing rings; a grid floor runs to a glowing horizon behind the page. Light mode is the white grid. Adds `crt` and `crt-ink` tokens. Import `themes/neon.css` and `themes/neon-fonts.css`.
- 68192e4: New Static theme: early-2000s alt rock. A sketchbook by day (aged paper, photocopy grain, pencil hatching, off-register red stencil titles in Big Shoulders Stencil) and a spray-painted concrete wall after dark. Duct-taped, slightly crooked pages; rough-cut stencil keys that glitch on hover; label-tape badges and tooltips (Special Elite); pin-badge avatars; an amp toggle with a pilot light; a VU meter for progress; an equalizer spinner; toasts in a media-player LCD. Adds `tape` and `lcd-green` tokens. Import `themes/static.css` and `themes/static-fonts.css`.

## 0.3.0

### Minor Changes

- 7f5384f: Two new themes.

  **Shonen** is a manga page: black ink on newsprint with one red spot color, and in dark mode the same page inverted, white ink on black. Screentone stands in for greys; cards are comic panels with heavy borders and no drop shadow; tooltips and toasts are speech bubbles with tails; popovers and menus are narration boxes; dialogs land on focus lines over a page drained to black and white. The big key rumbles ゴゴゴ on hover and hits ドン! when pressed, progress is ink with speed lines, and the tab marker is a red brush stroke. Bangers lettering over Zen Kaku Gothic New, with Dela Gothic One for sound effects. Import `@tessera-design/react/themes/shonen.css` and `themes/shonen-fonts.css`, then set `brand="shonen"`.

  **Jelly** is Y2K candy plastic. Surfaces are see-through and glossy, tinted in fruit flavors over a bubbly, pinstriped ground; keys are gel pills that squash when pressed and spring back; fields and toasts are virtual-pet LCD screens in a dot-matrix face; avatars are eggs; progress is a heart meter. Dark mode is the same toy in smoked plastic with a backlit green LCD. Comfortaa over Quicksand, with DotGothic16 on the LCD. Import `@tessera-design/react/themes/jelly.css` and `themes/jelly-fonts.css`, then set `brand="jelly"`.

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
