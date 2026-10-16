# Skeleton

A shimmering placeholder in the shape of content that is still loading.

**Consumer provides:** `lines` (default 1; the last line of several is shorter), `height`, `width`, or `circle` with `size` for avatars.

- Match the real layout so nothing jumps when content arrives.
- Show it only after about 300ms; faster loads should just appear.
- Hidden from screen readers. Put `aria-busy="true"` on the region that is loading.
