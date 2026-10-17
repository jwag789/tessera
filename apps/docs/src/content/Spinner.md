# Spinner

An indeterminate loading indicator: four tiles taking turns. It also exports `Kbd` for showing keys.

**Consumer provides:** optional `size` in px (default 20), `label` (announced to screen readers, default "Loading"), `className`. It takes `currentColor`, which is lapis by default.

- Show it only after about 300ms; faster work should just finish.
- Prefer Skeleton when you know the shape of what's coming, and Progress when you can measure it.
- Buttons have their own `loading` state. Don't put a Spinner inside a Button.
