---
"@tessera-design/tokens": patch
"@tessera-design/react": patch
---

`ToastProvider` no longer causes a hydration mismatch in server-rendered apps such as the Next.js App Router. The toaster now portals into `<body>` after mount instead of branching on `typeof document` during render.
