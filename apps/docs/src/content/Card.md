# Card

A container that groups one subject: a template, a project, a role.

**Consumer provides:** optional `eyebrow`, `title`, `children` (body), `actions`, `variant` (`flat` · `raised` · `tile`), `interactive` or `onClick` (adds the hover lift), `motif` (a 3×3 tile cluster in the corner), `as` (element, default `section`).

**Motion:** interactive cards lift 4px on hover over `duration-slow`. A `tile` card rises up and left off its hard shadow instead. With `motif`, the corner tiles scatter on hover and the saffron one breaks furthest from the grid.

- `flat` is the default. `raised` adds `shadow-md` for things that float.
- `tile` (ink border, `shadow-tile`) is the brand gesture: one per view, for the featured item.
- Padding is `space-6`; cards in a grid sit `space-6` apart. Never nest cards.
