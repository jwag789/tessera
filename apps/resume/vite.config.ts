import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Like the docs, the app builds against the component source, so library fixes show up without a rebuild.
export default defineConfig({
  base: process.env.APP_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@tessera-design/react/styles.css': fileURLToPath(new URL('../../packages/react/src/styles.css', import.meta.url)),
      '@tessera-design/react/fonts.css': fileURLToPath(new URL('../../packages/react/src/fonts.css', import.meta.url)),
      '@tessera-design/react/themes': fileURLToPath(new URL('../../packages/react/src/themes', import.meta.url)),
      '@tessera-design/react': fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url))
    }
  }
});
