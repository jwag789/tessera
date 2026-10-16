# Pagination

Moves between pages of a long list.

**Consumer provides:** `page`, `pageCount`, `onPageChange(page)`, optional `siblings` (pages shown each side of the current one, default 1) and `label`.

**Motion:** the current page is a lapis tile with a hard offset that bounces in when it changes; pages press down when clicked.

- Always shows the first and last page, and never hides a single page behind "…". The logic is exported as `paginationRange(page, count, siblings)` if you need it elsewhere.
- Previous and Next are disabled at the ends instead of disappearing, so the layout doesn't jump.
- Prefer "Load more" or infinite scroll for feeds; use pagination when people need to find their place again.
