# DatePicker

A field that opens a calendar to pick one day. `Calendar` is exported on its own for inline use.

**Consumer provides:** `label`, `value` + `onChange(date)` or `defaultValue`, optional `min`, `max`, `isDisabled(date)`, `weekStartsOn` (0 Sunday, 1 Monday), `locale`, `placeholder`, `hint`, `error`, `name` (posts `YYYY-MM-DD`).

**Motion:** months slide in from the direction you moved. The picked day lands as a lapis tile with a hard offset; today carries a small saffron tile.

- Keyboard follows the WAI-ARIA date grid: arrows move by day and week, Page Up/Down by month (Shift for year), Home/End to the week's ends, Enter picks, Escape closes.
- Dates are local days with no time. Format for display with the reader's locale; send `YYYY-MM-DD` to servers.
- For dates people know by heart (a birthday), three plain fields are faster than a calendar.
