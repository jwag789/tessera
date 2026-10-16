# Button

Triggers an action. One `primary` per view, for the thing the page is for; everything else is `secondary` or `ghost`.

**Consumer provides:** `children` (the label), `onClick`, optional `variant` (`primary` · `secondary` · `ghost` · `danger` · `tile`), `size` (`sm` 32px · `md` 40px · `lg` 52px), `loading`, `iconLeft`/`iconRight`, `block` for full width. Any native button attribute passes through.

**Motion:** a ripple spreads from the pointer on press; every button scales to 96% while held (`duration-instant`) and springs back (`ease-spring`). `primary` lifts 1px on hover with a `shadow-glow` halo and a light sweep. `tile` rises off the grid to `shadow-tile-lg` on hover and presses flat into it on click. A trailing icon nudges 3px right on hover.

- Labels are verb-first, sentence case, two or three words: "Export PDF", not "PDF Export" or "Click here".
- `tile` is the signature saffron button. Use it at most once per page, for the hero or onboarding CTA. Never in dense product UI.
- `danger` only for destructive actions, and put the confirmation in a Dialog.
- `loading` disables the button and swaps the left icon for a spinner. Change the label to the -ing form ("Saving").
- Don't put two `primary` buttons side by side.
