// noinspection DuplicatedCode

// 导入依赖模块。
const LogUtil = require('./util/log')
const ConfigUtil = require('./util/config')
const ScriptsConfig = require('./config/scripts')

// 运行脚本。
LogUtil.info('生成配置开始...')
run()
  .then(() => {
    LogUtil.info('生成配置完成')
  })
  .catch((e) => {
    LogUtil.error(`生成配置失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  })

async function run() {
  // 生成配置文件。
  LogUtil.info(`生成配置文件: ${ScriptsConfig.configPath}...`)
  ConfigUtil.generateConfigFile(ScriptsConfig.defaultConfig, ScriptsConfig.configPath)
}
