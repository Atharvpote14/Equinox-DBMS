import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  base: '/assets/',
  build: {
    outDir: '../public/assets',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})