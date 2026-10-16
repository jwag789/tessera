# Accordion

Stacked sections that expand in place: FAQs, settings groups, long forms split into parts.

**Consumer provides:** `items` (`{ id, title, content, disabled? }`), `type` (`single`: one open at a time, default; `multiple`), and `value` + `onChange(ids)` or `defaultValue`.

**Motion:** panels grow to their natural height over `duration-slow` (no fixed heights), and the plus tile spins 135° into an ×, filling `lapis`.

- Headings are real `h3` elements wrapping buttons, with `aria-expanded` and `aria-controls`. ↑/↓, Home and End move between headings.
- Collapsed panels are hidden from screen readers and the tab order.
- Don't hide the one thing everyone needs inside an accordion. Open the most important item by default.
