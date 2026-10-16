# Dialog

A modal that interrupts to confirm or collect something before the user continues.

**Consumer provides:** `open`, `onClose`, `title`, `children` (body), `actions` (buttons, primary last).

- Escape and clicking the scrim call `onClose`; focus moves into the dialog and returns on close.
- Title is a question for confirmations ("Delete this resume?"); buttons repeat the verb ("Delete"), never "OK".
- The safe choice is a `ghost` button on the left; the action is on the right.
- Don't stack dialogs. Don't use one for content that could be a page.
