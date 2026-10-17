# Slider

Picks a number from a range by dragging, when the exact value matters less than roughly where it sits.

**Consumer provides:** `label`, `value` + `onChange(number)` or `defaultValue`, optional `min`, `max`, `step`, `format(value)` for the shown value and the screen-reader value text, `marks`, `hint`, `disabled`, `name`.

**Motion:** the thumb is a tile with the hard offset; it tilts on hover and squashes while held.

- It's a native range input underneath, so arrow keys, Page Up/Down, Home/End and touch work everywhere.
- Always pass `format` when the unit isn't obvious ("8 years", "70% remote").
- Use NumberInput when people need to type an exact value.
