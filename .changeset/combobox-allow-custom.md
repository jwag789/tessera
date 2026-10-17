---
'@tessera/react': minor
---

`Combobox` takes `allowCustom` to accept text that isn't one of its options, for fields like a company name where the list is only suggestions. Typed text that matches nothing shows a "Use “…”" row first, and leaving the field keeps it as the value (`onChange(text, null)`); an exact match still resolves to the real option.
