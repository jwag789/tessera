import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // Everything here uses hooks or the DOM, so mark the bundle as client code for React Server Components (Next.js App Router).
  banner: { js: '"use client";' }
});
