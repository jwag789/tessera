# Table

Rows of records with the same fields: sortable columns, row selection and a sticky header. It scrolls sideways inside its own frame on narrow screens.

**Consumer provides:** `columns` (`{ key, header, align?, render?, sortable?, sortValue? }`), `rows`, `caption` (read by screen readers), `rowKey` (defaults to `row.id`). Sorting: `sort` + `onSortChange` or `defaultSort`, and `sortRows={false}` when the server sorts. Selection: `selectable`, `selected` + `onSelectionChange` or `defaultSelected`, `rowLabel` to name each checkbox. Also `stickyHeader` with `maxHeight`, and `empty` for zero rows.

- Clicking a sortable header cycles ascending, descending and unsorted, and sets `aria-sort`. Numbers and strings like "b2" and "b10" sort naturally, and empty values stay last.
- The header checkbox selects all visible rows and shows a dash when only some are selected. Give `rowLabel` so screen readers hear "Select Globex", not "Select row 3".
- Headers use the mono `eyebrow` treatment. Right-align numbers; their digits are tabular.
- Put status in a Badge, not colored text.
