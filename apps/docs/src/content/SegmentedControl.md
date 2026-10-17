# SegmentedControl

Two to five mutually exclusive options in a row that switch a view or a mode immediately.

**Consumer provides:** `label` (names the group for screen readers), `options` (strings or `{ value, label, disabled? }`), `value` + `onChange` or `defaultValue`, optional `size` (`sm`, `md`), `block` to fill the width.

**Motion:** the white tile slides to the chosen option with a small spring.

- It's a radio group: Tab reaches it once, arrow keys move between options.
- Use it for views and modes (List / Board), not for form answers that need a Submit; that's RadioGroup.
- Keep labels to one word where you can.
