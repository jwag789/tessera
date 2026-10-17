# Layout

Five primitives that lay out pages with the spacing tokens, so most screens need no custom CSS: `Stack`, `Inline`, `Grid`, `Container` and `Divider`.

**Consumer provides:** spacing as steps on the 4px grid (`gap={4}` is `space-4`, 16px), plus `align`, `justify` and `padding`. `as` changes the element (`<Stack as="section">`), and every native attribute passes through.

- **Stack:** a column with even gaps, the default for vertical rhythm.
- **Inline:** a row that wraps, for button groups, tags and toolbars. `justify="between"` pushes items to the ends.
- **Grid:** `columns={3}` for fixed columns, or `minChildWidth={220}` to reflow from phone to desktop with no media queries.
- **Container:** centers content at `sm` 640, `md` 768, `lg` 1024 or `xl` 1200px, with the page gutter built in.
- **Divider:** a hairline, horizontal or vertical, optionally with a label ("or").
