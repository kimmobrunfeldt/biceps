import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    exclude: ['@vite/client', '@vite/env', '@vlcn.io/crsqlite-wasm'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  resolve: {
    alias: {
      src: '/src',
    },
  },
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    fs: {
      strict: false,
    },
  },
})
