# RadioGroup

A fieldset of 2–5 mutually exclusive options, all visible at once.

**Consumer provides:** `label` (rendered as the legend), `options` (strings or `{ value, label, disabled }`), and either `value` + `onChange` (controlled) or `defaultValue`.

- Always preselect a sensible default; a group with nothing selected cannot be reset by the user.
- Above five options, use Select.
