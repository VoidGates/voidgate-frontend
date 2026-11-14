import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the site under /<repository>/; the deploy workflow sets
  // BASE_PATH. Local dev and other hosts keep the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  server: {
    // repassa /api para o backend em dev, sem precisar de CORS
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
