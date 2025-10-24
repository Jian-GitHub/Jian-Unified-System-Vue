import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import svgLoader from 'vite-svg-loader'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    svgLoader({
      svgo: false, // 可选，防止优化破坏图标
      defaultImport: 'component' // 确保导出的是 Vue 组件
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    allowedHosts: [
        'dev.jian.nz'
    ],
    proxy: {
      '/api': {
        // target: 'http://dev.jian.nz:30500',
        target: 'http://192.168.20.72:30500',
        // target: 'http://apollo.api.JianUnifiedSystem.com:30500',
        // target: 'http://apollo.osaka1.jianqi.jp:30500',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})
