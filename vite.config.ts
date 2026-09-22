import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        landing1: fileURLToPath(new URL('./landing1/index.html', import.meta.url)),
        landing2: fileURLToPath(new URL('./landing2/index.html', import.meta.url)),
        landing3: fileURLToPath(new URL('./landing3/index.html', import.meta.url)),
      },
    },
  },
})
