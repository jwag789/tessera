---
'@tessera/react': patch
---

Fixes found building Folio:
- Segmented `Progress` no longer highlights a "current" tile once every step is done.
- A horizontal `Stepper` in a narrow container (a drawer, a card) stacks each label under its marker instead of truncating it.
- Cartridge and Polygon surfaces set their text color, so text that inherits it (a drawer title, plain copy in a card) follows the surface palette instead of the page's.
