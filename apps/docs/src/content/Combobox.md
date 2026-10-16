# Combobox

A text input that filters a list as you type. Use it instead of Select once there are more than about 12 options, or when people know what they're looking for.

**Consumer provides:** `label`, `options` (same shape as Select), `value` + `onChange(value | null, option | null)` or `defaultValue`. Optional `placeholder`, `emptyText`, `hint`, `error`, `disabled`, `name`, and `filter(option, query)` to change matching.

**Motion:** the matching part of each label is marked with a saffron underline. Results reuse Select's option rows, so icons, descriptions and badges work the same.

- Keyboard follows the WAI-ARIA combobox pattern: type to filter, ↑/↓ move, Enter picks, Escape closes (a second Escape clears).
- The clear button empties the field and resets the value to `null`.
- Matching is on label, description and value by default; pass `filter` for fuzzy or server-side search.
