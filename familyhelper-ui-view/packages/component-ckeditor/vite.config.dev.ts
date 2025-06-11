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
  root: 'dev',
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    open: scriptsConfig.server.open,
    host: scriptsConfig.server.host,
    port: scriptsConfig.server.port,
    hmr: scriptsConfig.server.hmr
  }
})
