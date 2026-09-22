import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// emotion's css prop needs the jsx runtime to come from @emotion/react
export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
