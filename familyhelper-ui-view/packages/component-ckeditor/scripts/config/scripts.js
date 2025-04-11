/**
 * 模块的默认脚本配置。
 *
 * @type
 * {{
 *   commons: {logLevel: 'debug' | 'info' | 'warn' | 'error'},
 *   server: {open: boolean, host: string, port: number, https: boolean, hmr: boolean}
 * }}
 */
const defaultConfig = {
  // 通用配置。
  commons: {
    /**
     * 日志等级。
     *
     * @type {'debug' | 'info' | 'warn' | 'error'}
     */
    logLevel: 'info',
  },
  server: {
    /**
     * 是否自动打开浏览器。
     *
     * @type {boolean}
     */
    open: true,
    /**
     * 绑定的主机。
     *
     * @type {string}
     */
    host: '0.0.0.0',
    /**
     * 绑定的端口。
     *
     * @type {number}
     */
    port: 8088,
    /**
     * 是否启用 HTTPS。
     *
     * @type {boolean}
     */
    https: false,
    /**
     * 是否只启用热更新。
     *
     * @type {boolean}
     */
    hmr: false,
  },
}

/**
 * 配置文件的路径。
 *
 * @type {string}
 */
const configPath = 'scripts-config.json'

// 导出模块。
module.exports = { defaultConfig, configPath }
