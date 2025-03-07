/**
 * 模块的默认脚本配置。
 *
 * @type
 * {{
 *   commons: {logLevel: 'debug' | 'info' | 'warn' | 'error'},
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
        logLevel: "info",
    },
}

/**
 * 配置文件的路径。
 *
 * @type {string}
 */
const configPath = 'scripts-config.json'

// 导出模块。
module.exports = {defaultConfig, configPath}
