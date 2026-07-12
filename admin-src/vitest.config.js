import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Separate from vite.config.js on purpose (see Phase 10 test setup notes):
// vite.config.js is the production build config (base: '/admin/', custom
// outDir) and is left untouched. Vitest only needs the React plugin so JSX
// compiles; the build-specific options don't apply to the test run.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
  },
})
