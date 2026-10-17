# NumberInput

A number field with − and + buttons for counts and amounts people adjust in small steps.

**Consumer provides:** `label`, `value` + `onChange(number | null)` or `defaultValue`, optional `min`, `max`, `step`, `suffix` (a unit like "years"), `hint`, `error`, `disabled`, `name`.

- ↑/↓ step by `step`, Shift+↑/↓ by ten steps, Home/End jump to `min`/`max`. Typed values clamp to the range on blur or Enter.
- It's a `role="spinbutton"` with `aria-valuenow`, `-min` and `-max`. The step buttons are left out of the tab order, since the arrow keys do the same.
- An empty field is `null`, not 0. Decide what empty means for your form.
