# Tabs

Switches between sibling views of the same object without leaving the page.

**Consumer provides:** `items` (`{ id, label, content }`), `label` (accessible name for the tab list), and either `value` + `onChange` or `defaultValue`.

- Arrow keys, Home and End move between tabs (roving tabindex), per the WAI-ARIA tabs pattern.
- The active tab gets a 3px `lapis` bar; the rest are `ink-muted`.
- Keep labels to one or two words. Five tabs at most; past that, use navigation.
