import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Proxy GitHub archive downloads to avoid CORS issues in development
      '/api/github-zip': {
        target: 'https://github.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/github-zip/, ''),
        followRedirects: true,
      },
    },
  },
})
