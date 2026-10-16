# Breadcrumbs

Shows where the current page sits in a hierarchy and links back up it.

**Consumer provides:** `items` (`{ label, href?, onClick? }`; the last is the current page), optional `maxItems` (default 4) before the middle collapses into "…".

- The last item gets `aria-current="page"` and isn't a link. The trail is an ordered list inside `<nav aria-label="Breadcrumb">`.
- The "…" button expands the full path in place.
- Use it for hierarchies three or more levels deep. It doesn't replace the main navigation.
