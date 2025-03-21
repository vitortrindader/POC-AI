import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@react-pdf-viewer/core', '@react-pdf-viewer/default-layout'],
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
})
