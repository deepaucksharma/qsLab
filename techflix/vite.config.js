import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // This makes Vite listen on all addresses including WSL bridge
    strictPort: true,
    hmr: {
      port: 5173
    }
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})