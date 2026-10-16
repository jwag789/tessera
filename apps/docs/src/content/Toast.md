# Toast

A brief confirmation of something the user just did, shown bottom-center or bottom-right on `z-toast`.

**Consumer provides:** `children`, optional `title`, `icon`, `action` (`{ label, onClick }`, usually Undo), `onDismiss`, `duration` in ms (draws a draining timer line). Positioning and dismissal are up to the app (5 seconds; 8 with an action).

**Motion:** springs up 24px into place (`ease-spring`, `duration-slow`). Stack several 12px apart, each entering 160ms after the last.

- Inverted: `ink` ground, `bg` text, `inverse-accent` icon and action, in both themes.
- Never put errors that need action in a toast; use an Alert.
