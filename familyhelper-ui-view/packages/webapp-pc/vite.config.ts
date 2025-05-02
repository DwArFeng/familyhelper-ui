// noinspection DuplicatedCode

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { debug } from './scripts/util/log.js'
import { parseConfig } from './scripts/util/config.js'
import { configPath, defaultConfig } from './scripts/config/scripts.js'

// 解析模块的默认脚本配置。
const scriptsConfig = parseConfig(defaultConfig, configPath)

// 输出脚本配置。
debug('Dev server 配置:')
debug(`  open: ${scriptsConfig.server.open}`)
debug(`  host: ${scriptsConfig.server.host}`)
debug(`  port: ${scriptsConfig.server.port}`)
debug(`  https: ${scriptsConfig.server.https}`)
debug(`  hmr: ${scriptsConfig.server.hmr}`)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/familyhelper-ui/ui/pc/',
  server: {
    open: scriptsConfig.server.open,
    host: scriptsConfig.server.host,
    port: scriptsConfig.server.port,
    hmr: scriptsConfig.server.hmr,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    manifest: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/js/chunk-[hash].js',
        chunkFileNames: 'assets/js/chunk-[hash].js',
        assetFileNames: (assertInfo): string => {
          const info: string[] = assertInfo.names[0].split('.')
          const extension: string = info[info.length - 1].toLowerCase()
          let assertSubDirectory: string
          // 媒体资产。
          if (['mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'aac'].indexOf(extension) >= 0) {
            assertSubDirectory = 'media'
          }
          // 图片资产。
          else if (
            ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'avif'].indexOf(extension) >= 0
          ) {
            assertSubDirectory = 'img'
          }
          // 字体资产。
          else if (['ttf', 'otf', 'woff', 'woff2', 'eot'].indexOf(extension) >= 0) {
            assertSubDirectory = 'font'
          }
          // 样式资产。
          else if (['css'].indexOf(extension) >= 0) {
            assertSubDirectory = 'css'
          }
          // 库资产。
          else if (['js', 'mjs'].indexOf(extension) >= 0) {
            assertSubDirectory = 'lib'
          }
          // 其它资产。
          else {
            assertSubDirectory = 'other'
          }
          return `assets/${assertSubDirectory}/chunk-[hash].[ext]`
        },
      },
    },
  },
})
