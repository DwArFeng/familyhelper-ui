// noinspection DuplicatedCode

// 导入依赖模块。
const LogUtil = require('./util/log.js')
const ExecUtil = require('./util/exec.js')

// 运行脚本。
LogUtil.info('serve 开始...')
run()
  .then(() => {
    LogUtil.info('serve 完成')
  })
  .catch((e) => {
    LogUtil.error(`serve 失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  })

async function run() {
  // 执行指令。
  LogUtil.info('执行指令: vite...')
  try {
    await ExecUtil.spawn('vite', [])
    LogUtil.debug('执行指令成功')
  } catch (e) {
    LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  }
}
