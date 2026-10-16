# SidebarNav

Vertical navigation for apps and docs: titled sections, icons, counts, nested groups and an icon-only mode.

**Consumer provides:** `sections` (`{ title?, items }`; items are `{ label, href?, icon?, badge?, active?, onClick?, items? }`), optional `collapsed`, `header`, `footer`, `label`.

**Motion:** icons nudge up on hover, nested groups rise in when opened, and chevrons flip.

- An item with `items` becomes a toggle; the group holding the current page starts open.
- `collapsed` shows icons only and moves labels into tooltips via `title`. Give every top-level item an icon if you use it.
- These docs use SidebarNav for their own sidebar.
