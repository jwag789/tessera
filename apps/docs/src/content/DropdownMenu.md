# DropdownMenu

A list of actions that opens from a button: row actions, an account menu, "more" overflow.

**Consumer provides:** `trigger` (a Button), `items` (`{ label, icon?, shortcut?, danger?, disabled?, onSelect }`, `{ type: 'separator' }` or `{ type: 'label', label }`), optional `placement` and `label`.

**Motion:** springs open, items cascade in 18ms apart, and the active item's icon tilts. Destructive items turn `danger-soft` when active.

- Keyboard follows the WAI-ARIA menu button pattern: Enter, Space or ↓ opens on the first item, ↑ on the last; arrows, Home and End move; typing jumps to a matching item; Enter runs; Escape closes and returns focus.
- Menus hold actions, not navigation or settings. For choosing a value use Select.
- Group with separators and labels when there are more than six items. Put destructive items last.
- `shortcut` is display only; wire the real shortcut with `useHotkey`.
