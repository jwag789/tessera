# Drawer

A panel that slides in from an edge for details or a short form, so people keep their place on the page.

**Consumer provides:** `open`, `onClose`, `title`, optional `description`, `side` (`right` by default, `left`, `bottom`), `size`, `footer` (buttons, primary last), `children`.

**Motion:** slides in from its edge over `duration-slow` and back out faster.

- It's modal like Dialog: focus moves in, Tab stays inside, Escape and the scrim close it, the page behind stops scrolling, and focus returns afterward.
- Use a Drawer for editing one record from a list. Use a Dialog for a decision, and a page for anything longer than a screen.
- On phones, side drawers take the full width.
