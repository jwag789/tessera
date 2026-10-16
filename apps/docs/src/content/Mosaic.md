# Mosaic

The brand motif as a live surface: a grid of tiles in four fixed lapis shades (`tile-1` to `tile-4` on `tile-ground`, the same in both themes) with one saffron tile out of place. Tiles drop in on mount along the diagonal; near the pointer they lift and the nearest turns saffron.

**Consumer provides:** `columns` (default 12), `rows` (default 8), `seed` (changes the pattern and where the saffron tile lands), `gap` in px (default 6), `interactive` (default true), optional `children` overlaid bottom-left.

- Use it once per page: a hero panel, an empty state, a sign-in side panel. Never behind body text.
- Text overlaid on it is `on-lapis-deep`, at `heading-lg` or larger.
- The assembly runs once per page load (`duration-reveal`). With reduced motion, tiles appear in place and do not follow the pointer.
- Keep it to about 200 tiles; past that, use larger tiles instead of more of them.
