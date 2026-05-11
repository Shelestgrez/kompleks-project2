import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/** GitHub Pages project sites use /repo-name/; user/org pages use /. Set via VITE_BASE_PATH in CI. */
function publicBase(): string {
  const raw = process.env.VITE_BASE_PATH?.trim()
  if (!raw || raw === '/') return '/'
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

const apiProxy = {
  '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/files': { target: 'http://127.0.0.1:8000', changeOrigin: true },
} as const

export default defineConfig({
  base: publicBase(),
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { ...apiProxy },
  },
  preview: {
    port: 5173,
    proxy: { ...apiProxy },
  },
})
