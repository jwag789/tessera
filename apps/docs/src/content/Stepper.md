# Stepper

Shows where someone is in a multi-step flow: what's done, what's now and what's next.

**Consumer provides:** `steps` (`{ id, label, description? }`), `current` (index), optional `onStepClick(index)` to allow going back, `orientation` (`horizontal` or `vertical`), `label`.

**Motion:** completed markers turn lapis with a check and bounce in. The current step is the saffron tile.

- The current step has `aria-current="step"`, and each step announces whether it's completed or not started.
- Only completed steps are clickable. Going forward happens through your own Continue button, after validation.
- On phones the horizontal stepper keeps the bars but shows only the current step's label.
