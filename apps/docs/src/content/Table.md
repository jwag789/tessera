# Table

Rows of records with the same fields. Scrolls horizontally inside its own frame on narrow screens.

**Consumer provides:** `columns` (`{ key, header, align?, render? }`), `rows` (objects with an `id`), `caption` (read by screen readers).

- Headers use the mono `eyebrow` treatment on `surface-sunken`.
- Right-align numbers (`align: 'right'`); digits are tabular.
- Put status in a Badge, not colored text.
