# Alert

An inline message about the page or section it sits in. For a passing confirmation, use Toast.

**Consumer provides:** `tone` (`info` · `success` · `warning` · `danger`), optional `title`, `children` (one or two sentences), `onDismiss` to show a close button.

- Each tone has its own icon, so the meaning survives without color.
- `danger` and `warning` use `role="alert"` and are announced; `info` and `success` use `role="status"`.
- Say what happened and what to do next. No "Oops", no apologies.
