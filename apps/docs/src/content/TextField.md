# TextField

A labelled single-line input with an optional leading icon, hint or error.

**Consumer provides:** `label` (always — no placeholder-only fields), optional `icon` (an `Icon` name), `hint`, `error`, `id`; every native `<input>` attribute passes through.

**Motion:** on focus the border turns `lapis`, a 4px `lapis-glow` halo eases in, and the label and icon turn `lapis`. A new `error` shakes the field once and the message rises in.

- Placeholder text is an example value, never instructions.
- `error` replaces the hint, sets `aria-invalid` and is announced via `aria-describedby`. Write errors as the fix: "Enter a complete email address."
- Validate on blur or submit, not on every keystroke.
- Fields stack with `space-4` between them; form sections with `space-8`.
