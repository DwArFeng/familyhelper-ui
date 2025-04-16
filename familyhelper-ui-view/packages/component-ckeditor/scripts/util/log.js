// noinspection DuplicatedCode

// 导入依赖模块。
const fs = require('node:fs')
const formatDate = require('date-fns/format').format
const PathUtil = require('./path')
const ConfigUtil = require('./config')
const ScriptsConfig = require('../config/scripts')

// 读取 package.json。
const packageJson = JSON.parse(
  fs.readFileSync(PathUtil.parsePath('package.json'), { encoding: 'utf-8' }),
)

/**
 * 模块的名称。
 *
 * @type {string}
 */
const moduleName = packageJson.name

/**
 * 日志等级的顺序，从低到高。
 *
 * @type {string[]}
 */
const logLevelOrder = ['debug', 'info', 'warn', 'error']

/**
 * 模块的默认脚本配置。
 *
 * @type
 * {{
 *   commons: {logLevel: 'debug' | 'info' | 'warn' | 'error'},
 *   server: {open: boolean, host: string, port: number, https: boolean, hmr: boolean}
 * }}
 */
const scriptsConfig = ConfigUtil.parseConfig(ScriptsConfig.defaultConfig, ScriptsConfig.configPath)

/**
 * 当前日志等级的索引。
 *
 * @type {number}
 */
const currentLogLevelIndex = logLevelOrder.indexOf(scriptsConfig.commons.logLevel.toLowerCase())

/**
 * 以 Debug 日志级别记录日志。
 *
 * 当前日志级别小于等于 debug 时，记录日志。
 *
 * @param {string} message 日志消息。
 * @returns {void}
 */
function debug(message) {
  // 如果日志级别大于 debug，则不记录日志。
  if (currentLogLevelIndex > logLevelOrder.indexOf('debug')) {
    return
  }

  // 生成记录日志的消息。
  const logMessage = `[${formatNow()}] [DEBUG] [${moduleName}]: ${message}`
  // 控制台输出日志。
  console.debug(logMessage)
}

/**
 * 以 Info 日志级别记录日志。
 *
 * 当前日志级别小于等于 info 时，记录日志。
 *
 * @param {string} message 日志消息。
 * @returns {void}
 */
function info(message) {
  // 如果日志级别大于 info，则不记录日志。
  if (currentLogLevelIndex > logLevelOrder.indexOf('info')) {
    return
  }
  // 生成记录日志的消息。
  const logMessage = `[${formatNow()}] [INFO] [${moduleName}]: ${message}`
  // 控制台输出日志。
  console.info(logMessage)
}

/**
 * 以 Warn 日志级别记录日志。
 *
 * 当前日志级别小于等于 warn 时，记录日志。
 *
 * @param {string} message 日志消息。
 * @returns {void}
 */
function warn(message) {
  // 如果日志级别大于 warn，则不记录日志。
  if (currentLogLevelIndex > logLevelOrder.indexOf('warn')) {
    return
  }
  // 生成记录日志的消息。
  const logMessage = `[${formatNow()}] [WARN] [${moduleName}]: ${message}`
  // 控制台输出日志。
  console.warn(logMessage)
}

/**
 * 以 Error 日志级别记录日志。
 *
 * 当前日志级别小于等于 error 时，记录日志。
 *
 * @param {string} message 日志消息。
 * @returns {void}
 */
function error(message) {
  // 如果日志级别大于 error，则不记录日志。
  if (currentLogLevelIndex > logLevelOrder.indexOf('error')) {
    return
  }
  // 生成记录日志的消息。
  const logMessage = `[${formatNow()}] [ERROR] [${moduleName}]: ${message}`
  // 控制台输出日志。
  console.error(logMessage)
}

/**
 * 格式化当前时间。
 *
 * 时间格式为：yyyy-MM-dd HH:mm:ss.SSS
 *
 * @returns {string} 格式化的当前时间。
 */
function formatNow() {
  return formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')
}

// 导出模块。
module.exports = {
  debug,
  info,
  warn,
  error,
}
