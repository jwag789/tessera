# Textarea

A labelled multi-line input that grows with what's typed, for summaries, notes and bullet points.

**Consumer provides:** `label`, optional `hint`, `error`, `maxLength` (adds a live "used / max" count), `autoResize` (default on), `showCount`; every native `<textarea>` attribute passes through.

- It starts at three rows and grows; turn `autoResize` off for a fixed box with a resize handle.
- The count turns `warning` at the limit and is announced politely to screen readers.
- Use TextField for anything that fits on one line.
