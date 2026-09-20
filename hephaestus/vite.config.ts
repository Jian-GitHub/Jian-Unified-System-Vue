import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
// @ts-ignore
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// Hephaestus dev server:
//   port 15173 (matches backend CORS allow-list)
//
// /api → Hephaestus Income API at 127.0.0.1:18101 (mounted at /api/v1).
// /api/v1/auth/start and /api/v1/auth/callback belong to the Income BFF.
// Apollo URLs and client credentials are configured only in backend YAML.
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      // @ts-ignore
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 15173,
    strictPort: true,
    host: true,
    allowedHosts: ['dev.jian.nz'],
    proxy: {
      '/api': {
        target: process.env.HEPHAESTUS_API_TARGET || 'http://localhost:18101',
        changeOrigin: true,
      },
    },
  },
})
