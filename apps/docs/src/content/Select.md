# Select

A custom dropdown for picking one option from a list, with rich options: an icon tile, a description line and a badge. Use it for 4–12 options; under 4, use RadioGroup.

**Consumer provides:** `label`, `options` (strings, or `{ value, label, description?, icon?, badge?, badgeTone?, disabled? }`), and either `value` + `onChange(value, option)` or `defaultValue`. Optional `placeholder`, `hint`, `error`, `disabled`, `name` (adds a hidden input so it posts with a form), `defaultOpen` (for demos).

**Motion:** the menu springs open from the trigger (`ease-spring`, `duration-base`) and options cascade in 22ms apart. The chevron flips and turns `lapis`. The selected option's check draws itself in, and the hovered option's icon tile tilts. The menu closes in 140ms.

- Keyboard follows the WAI-ARIA select-only combobox pattern: Enter, Space or the arrow keys open it; arrows, Home and End move; Enter or Space picks; Escape closes; typing jumps to the first matching option.
- The menu opens upward when there isn't room below.
- `icon` is a short string (a letter or two) or any node; it renders in a 30px tile.
- Keep labels short and put the detail in `description`. Order options by likelihood or alphabetically.
- Show unavailable options as `disabled` instead of hiding them, so people know they exist.
