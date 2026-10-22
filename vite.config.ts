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
        adminCatalog: fileURLToPath(new URL('./admin/catalogo/index.html', import.meta.url)),
        adminLogin: fileURLToPath(new URL('./admin/login/index.html', import.meta.url)),
        landing3: fileURLToPath(new URL('./landing3/index.html', import.meta.url)),
        landing1: fileURLToPath(new URL('./prototipos/landing1/index.html', import.meta.url)),
        landing2: fileURLToPath(new URL('./prototipos/landing2/index.html', import.meta.url)),
        catalogo: fileURLToPath(new URL('./prototipos/catalogo/index.html', import.meta.url)),
        ...Object.fromEntries(['memoria-em-flor', 'curva-da-materia', 'geometria-quieta', 'relicario-de-mesa', 'essencia-ravera'].map((slug) => [slug, fileURLToPath(new URL(`./prototipos/catalogo/${slug}/index.html`, import.meta.url))])),
      },
    },
  },
})
