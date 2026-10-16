# Avatar

A round photo or initials for a person. `AvatarGroup` overlaps several.

**Consumer provides:** `name` (used for initials, color and the accessible label), optional `src`, `size` in px (default 36).

- Without a photo it shows two initials on one of four tinted grounds, picked from the name so a person keeps the same color everywhere.
- Hovering a group fans it out; hovering one avatar lifts it.
- Sizes: 28 in tables, 36 default, 48 in headers, 96 on a profile.
