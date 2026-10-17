---
'@tessera/react': minor
'@tessera/tokens': minor
---

Cartridge reworked to read as its own theme. A charcoal plastic shell is the ground in both modes, with light label surfaces on top (cards, inputs, menus, dialogs and secondary keys re-declare the palette, so text stays AA on both). Green is the primary color, and green, red, blue and yellow show up across buttons, navbar stripe, tabs, sidebar sections, segmented controls, avatars and featured cards. Lilita One headings are bigger. Add `data-surface="label"` to make your own panel a label. Theme CSS now re-declares the full base token set and resets tokens that only other themes define, so a theme nested inside another no longer inherits its fonts or colors.
