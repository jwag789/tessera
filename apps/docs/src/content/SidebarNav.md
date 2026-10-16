# SidebarNav

Vertical navigation for apps and docs: titled sections, icons, counts, nested groups and an icon-only mode.

**Consumer provides:** `sections` (`{ title?, items }`; items are `{ label, href?, icon?, badge?, active?, onClick?, items? }`), optional `collapsible` (adds the collapse/expand icon button), `collapsed` + `onCollapsedChange` or `defaultCollapsed`, `header`, `footer`, `label`.

**Motion:** icons nudge up on hover, nested groups rise in when opened, chevrons flip, and the collapse icon mirrors to point the way it will go.

- An item with `items` becomes a toggle; the group holding the current page starts open.
- Collapsed, the sidebar shows icons only. Labels become tooltips on the right, and a group's icon opens its items in a flyout. A group holding the current page keeps the highlight on its icon.
- Give every top-level item an icon if the sidebar can collapse.
- The toggle is an icon button labelled "Collapse sidebar" or "Expand sidebar", with `aria-pressed` reflecting the state.
- These docs use SidebarNav for their own sidebar.
