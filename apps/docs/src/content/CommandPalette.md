# CommandPalette

A searchable list of everything you can do, opened with ⌘K or Ctrl+K. Power users stop hunting through menus.

**Consumer provides:** `open`, `onOpenChange`, `commands` (`{ id, label, group?, icon?, shortcut?, keywords?, onRun }`), optional `placeholder` and `emptyText`. Pair it with `useHotkey('mod+k', () => setOpen(true))`.

**Motion:** springs down from the top third of the screen. The active row's arrow slides in.

- Fuzzy matching: letters must appear in order, and word starts and prefixes rank higher. `keywords` catch synonyms ("download" finds Export PDF).
- With an empty query, commands show grouped by `group`; while searching, they're ranked in one list.
- ↑/↓ move, Enter runs and closes, Escape closes. Focus returns to where it was.
- Press ⌘K (or Ctrl+K) anywhere in these docs to try it.
