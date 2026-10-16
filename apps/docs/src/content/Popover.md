# Popover

A non-modal floating panel next to its trigger, for extra controls or detail that would clutter the page: share settings, a filter form, a definition.

**Consumer provides:** `trigger` (usually a Button; it gets `aria-expanded`), `children`, optional `title` (also names the panel for screen readers), `placement` (`bottom-start` by default; any side with `-start`/`-end`), `width`, and `open` + `onOpenChange` or `defaultOpen`.

**Motion:** springs out of the side it opens from and fades out in 140ms. It flips to the other side when there's no room and slides along the edge to stay on screen.

- Focus moves to the first control inside. Escape closes it and returns focus to the trigger; clicking outside closes it.
- Keep it to one task. If it needs a title, a form and two buttons, it's probably a Dialog.
- Popover is built on `Floating`, the same positioning layer as DropdownMenu, DatePicker and Tooltip. Use `Floating` directly for custom floating UI.
