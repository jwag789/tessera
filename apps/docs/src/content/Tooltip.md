# Tooltip

A short label shown on hover and keyboard focus, for icon-only buttons or truncated text.

**Consumer provides:** `content` (a few words), one focusable child, optional `placement` (`top` · `bottom` · `left` · `right`, default `top`), `delay` (ms before showing on hover, default 250), and `open` to force it visible.

**Motion:** pops out of the side it points from. It renders in a portal, so it is never clipped by a scrolling container, and flips if there's no room.

- Pick the side with the most room and the least in the way: `top` by default, `bottom` near the top of the screen, `left`/`right` in a vertical toolbar.
- Never put essential information or interactive content in a tooltip; touch users may never see it.
- Wired with `aria-describedby`; Escape hides it.
