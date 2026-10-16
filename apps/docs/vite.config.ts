import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The docs build against the component source, so edits show up without rebuilding the package.
// DOCS_BASE sets the public path, e.g. "/tessera/" for GitHub Pages.
export default defineConfig({
  base: process.env.DOCS_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@tessera/react/styles.css': fileURLToPath(new URL('../../packages/react/src/styles.css', import.meta.url)),
      '@tessera/react/fonts.css': fileURLToPath(new URL('../../packages/react/src/fonts.css', import.meta.url)),
      '@tessera/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url))
    }
  }
});
