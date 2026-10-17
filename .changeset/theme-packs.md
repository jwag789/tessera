---
'@tessera/react': minor
'@tessera/tokens': minor
---

Theme packs. Themes are a separate axis from light/dark mode, set with `data-brand` or `ThemeProvider`'s new `brand`/`defaultBrand`/`onBrandChange` (also on `useTheme()`). Ships Soft (periwinkle and apricot, soft shadows, rounder corners) and Cartridge (late-90s console palette, rounded chunky keys that press down, Lilita One and Nunito). Import `@tessera/react/themes/<name>.css`; token-only versions are at `@tessera/tokens/themes/<name>.css`, and `themes` lists them with labels and descriptions. Theme treatments are wrapped in `@scope`, so nested areas with a different theme keep their own look, and base tokens now also apply under `data-brand="tessera"`.
