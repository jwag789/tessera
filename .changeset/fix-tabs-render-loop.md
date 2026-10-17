---
'@tessera/react': patch
---

Fix an endless re-render in Tabs that froze the page when a Tabs mounted after web fonts had loaded (for example, on client-side navigation). SegmentedControl gets the same guard.
