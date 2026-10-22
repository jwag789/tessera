# @tessera-design/tokens

Design tokens for **Tessera**: colors for light and dark mode, type, spacing, radius, shadow and motion, plus three theme packs. Use them as CSS variables in any stack, or as data in JavaScript.

**[Docs](https://jwag789.github.io/tessera/)** · [Color](https://jwag789.github.io/tessera/#color) · [Themes](https://jwag789.github.io/tessera/#themes) · [Source](https://github.com/jwag789/tessera)

Using React? Install [`@tessera-design/react`](https://www.npmjs.com/package/@tessera-design/react) instead; its stylesheet already includes these tokens.

## Install

```bash
npm install @tessera-design/tokens
```

## CSS variables

```css
@import '@tessera-design/tokens/tokens.css';

.panel {
  background: var(--surface);
  color: var(--ink);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}
```

Light is the default. Dark follows `prefers-color-scheme`, and `data-theme="dark"` or `data-theme="light"` on any element forces one for that subtree. Each type style is also a class (`.display-lg`, `.body`, `.eyebrow` and so on).

## Themes

Load a theme after the base tokens, then set `data-brand` on any element:

```css
@import '@tessera-design/tokens/tokens.css';
@import '@tessera-design/tokens/themes/polygon.css';
@import '@tessera-design/tokens/themes/polygon-fonts.css';
```

```html
<html data-brand="polygon">
```

Themes: `atelier`, `cartridge`, `polygon`, `gloop`, `shonen`, `jelly`, `neon`, `static`, `lagoon`, `clay`, `cutout` (plus the default, `tessera`). These files hold the tokens only; `@tessera-design/react/themes/*` adds the component styling too.

## JavaScript

```ts
import { tokens, cssVar, themes } from '@tessera-design/tokens';

cssVar('lapis');            // "var(--lapis)"
tokens.color.tokens;        // every color with its light and dark value and usage note
themes.map((t) => t.label); // ["Tessera", "Cartridge", "Gloop", "Polygon"]
```

The raw source is at `@tessera-design/tokens/tokens.json`. Types include `TokenName`, `ColorToken` and `ThemeName`.

## License

MIT
