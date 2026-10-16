Tessera is a bold, modern design system for product teams who ship fast and want their UI to look decided. It is built from small square tiles: a 4px grid, tight radii, one saffron tile out of place. Its first home is a resume builder, so the examples talk about resumes, templates and applications, but nothing in it is resume-specific.

## Principles

1. **Decided, not decorated.** Every screen has one obvious next action. Color goes where attention should go; everything else stays `ink` on `bg`.
2. **Built from tiles.** Layouts snap to the 4px grid (`space-*`). Corners stay tight (`radius-md` on controls). Shapes are square before they are round.
3. **One tile out of place.** Saffron and `shadow-tile` are the brand's signature. Use each at most once per view, on the thing you most want noticed.
4. **Legible in both themes.** Every text token names the grounds it is legible on, and holds 4.5:1 there in light and dark.

## Voice and copy

- Write like a sharp colleague: plain, direct, specific. Short sentences. No exclamation marks.
- Address the user as "you". Tessera never says "we" in product UI.
- Sentence case everywhere: buttons, headings, tabs, menu items. Product names keep their own casing.
- Buttons are verb-first: "Export PDF", "Add role", "Start building". Never "OK", "Submit" or "Click here".
- Errors state the fix: "Enter a complete email address." Not "Invalid input" or "Oops, something went wrong".
- Numbers are numerals: "3 roles", "2 pages". Dates read "Oct 15, 2026".
- No emoji in UI text.

## Color

- The ground is `bg`; content containers are `surface`; wells, table headers and tracks are `surface-sunken`.
- Text is `ink`, secondary text `ink-muted`. Both read on `bg`, `surface` and `surface-sunken` in both themes.
- `lapis` is the brand and the interaction color: primary buttons, selected states, links, focus. Text on a lapis fill is `on-lapis`, never literal white, because dark mode flips it to ink.
- `saffron` is the accent. It is a fill only (never text) and always carries `on-saffron` text. One saffron element per view.
- Status colors (`success`, `warning`, `danger`) each have a `-soft` ground. Status is always paired with an icon or a word, never color alone.
- Borders: `line` for decorative hairlines, `line-strong` for anything a user must find (inputs, checkboxes). `line-strong` holds 3:1 against `bg` and `surface`.
- Inverted surfaces (toasts, tooltips) use `ink` as the ground and `bg` as the text, with `inverse-accent` for the one highlight.

## Type

- Three families, all on Google Fonts: **Bricolage Grotesque** (`display`) for display and headings, **Instrument Sans** (`sans`) for everything people read and click, **JetBrains Mono** (`mono`) for code, eyebrows and table headers.
- Use the display face only at 17px and up (`heading-sm` and larger). Below that, `sans`.
- One `display-2xl` per page at most, and only on marketing surfaces. Product screens top out at `display-lg`.
- Body copy is `body` (16/24). Dense UI uses `body-sm` (14/20). Keep running text near 65 characters per line.
- Eyebrows (`eyebrow`) are uppercase mono with 0.08em tracking, set `ink-muted`, directly above a heading.
- Headings get `text-wrap: balance`. Digits in tables and stats use `font-variant-numeric: tabular-nums`.

## Space and layout

- Everything sits on a 4px grid. Use only `space-*` tokens for padding and gaps.
- Defaults: `space-4` between fields, `space-6` card padding and grid gaps, `space-8` between form sections, `space-12` to `space-16` between page sections.
- Content width: 1200px max for apps, 720px for reading. Side gutter `space-4` on phones, `space-6` from 768px.
- Prefer `gap` on flex and grid over margins.

## Shape and depth

- Radii are tight: `radius-md` (6px) for every control, `radius-lg` (10px) for cards and alerts, `radius-xl` (16px) for dialogs. `radius-full` only for avatars, switches and pills.
- Soft shadows mean elevation: `shadow-sm` resting, `shadow-md` for menus and toasts, `shadow-lg` for dialogs.
- `shadow-tile` (a hard 4px offset in `ink`, `lapis` in dark mode) is not elevation; it is the brand gesture. One per view: the hero CTA (`Button variant="tile"`), the featured card (`Card variant="tile"`).

## Motion

Tessera moves like tiles: things drop into place, land with a small bounce, and lift off the grid when you touch them. Motion confirms what happened; it never decorates.

- **Durations:** `duration-instant` (80ms) press-down, `duration-fast` (140ms) hover color, `duration-base` (220ms) toggles, checks and the tab indicator, `duration-slow` (360ms) dialogs, toasts and card lifts, `duration-reveal` (900ms) the one-time hero and mosaic assembly. Space items entering in sequence by `duration-stagger` (40ms).
- **Easing:** `ease-out` for anything entering or moving. `ease-spring` (one small overshoot) for small things landing: tiles, switch thumbs, checkmarks, toasts. Never spring a large panel. `ease-snap` for hover lifts. `ease-in` for exits only, and exits run faster than entrances.
- **Press:** every button scales to 96% while held and a ripple spreads from the pointer. Checkboxes squash to 85% and the check draws itself in.
- **Lift:** interactive cards rise 4px on hover. Anything wearing `shadow-tile` rises up and left to `shadow-tile-lg` instead, and presses flat into the grid on click.
- **Arrive:** alerts, toasts, table rows and tab panels rise 8px as they appear; lists stagger. Dialogs spring up from 94% over a blurred scrim and leave faster than they came.
- **The reveal:** once per page, the hero may assemble itself (the Mosaic, the cover, the Showcase). Everything else is at rest in under 400ms.
- **Reduced motion:** with `prefers-reduced-motion`, every animation and transition drops to an instant change, the Mosaic stops following the pointer, and spinners slow down. Nothing is hidden behind an animation, so the page reads the same.

## The Mosaic

The `Mosaic` component is the brand motif as a live surface: lapis tiles in four fixed shades (`tile-1` to `tile-4` on `tile-ground`) with one saffron tile out of place. It looks the same in both themes, like a logo. Use it once per page: a hero, an empty state, a sign-in panel. Text on it is `on-lapis-deep`, `heading-lg` or larger. The Showcase card shows it in a full hero.

## Focus and accessibility

- Keyboard focus is always visible: a 2px gap in `bg`, then a solid 2px `focus` ring (`lapis`). It holds 3:1 on every surface in both themes.
- Every input has a visible label. Errors are linked with `aria-describedby`.
- Hit targets are at least 32px tall (`Button size="sm"`), 40px by default.
- Components follow the WAI-ARIA patterns: tabs use roving tabindex, dialogs trap focus and close on Escape, switches use `role="switch"`.

## Iconography

- Icons are 24×24 line icons, 2px stroke, round caps and joins, drawn in `currentColor`. Render at 16px inline and 20px in alerts.
- The bundle ships the small set the components need (`Icon`: check, chevron, x, info, success, warning, danger, sparkle). For anything else use Lucide, which matches the stroke and grid.
- Icons never replace a label on their own, except in an icon button with a Tooltip and an `aria-label`.

## Logo

- The mark is four tiles with the top-right one in saffron, knocked up and out of the grid. See the Logos asset group for files, sizes and clear space.
- Pair it with the word "Tessera" in `heading-md`.
