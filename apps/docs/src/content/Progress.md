# Progress

Shows how far along a task is. Continuous for uploads and exports; `steps` for multi-step flows.

**Consumer provides:** `value`, `max` (default 100), `label`, optional `steps` (segmented, reads "3 of 5") and `tone: 'success'`.

**Motion:** the bar grows from zero on mount over `duration-reveal` and carries moving stripes while in progress (`tone: 'success'` stops them). Segments fill one after another, 90ms apart; the current step is saffron.

- The segmented variant is the tessera motif in miniature: one tile per step.
- If you can't measure progress, use a loading Button or Skeleton instead of a fake bar.
