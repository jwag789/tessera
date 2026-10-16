# Navbar

The top bar of a site or app: brand, a few primary links and actions.

**Consumer provides:** `brand` (logo and name, usually a link home), `links` (`{ label, href?, active?, onClick? }`), `actions` (buttons or an avatar menu), optional `sticky` and `label`.

**Motion:** the current link's lapis underline draws in from its center. Below 768px the links fold into a menu button that drops a sheet.

- The current link gets `aria-current="page"`. Escape closes the mobile sheet.
- Five links at most. Anything else belongs in a SidebarNav or a DropdownMenu in `actions`.
- One `primary` or `tile` button in `actions`, at most.
