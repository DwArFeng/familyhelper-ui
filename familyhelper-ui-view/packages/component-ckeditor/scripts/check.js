// noinspection DuplicatedCode

// 导入依赖模块。
const LogUtil = require('./util/log.js')
const ExecUtil = require('./util/exec.js')

// 运行脚本。
LogUtil.info('开始 check...')
run()
  .then(() => {
    LogUtil.info('check 完成')
  })
  .catch((e) => {
    LogUtil.error(`check 失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  })

async function run() {
  // 执行指令。
  LogUtil.info('执行指令: prettier --check src/...')
  try {
    await ExecUtil.exec('prettier --check src/')
    LogUtil.debug('执行指令成功')
  } catch (e) {
    LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  }

  // 执行指令。
  LogUtil.info('执行指令: eslint ....')
  try {
    await ExecUtil.exec('eslint .')
    LogUtil.debug('执行指令成功')
  } catch (e) {
    LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  }

  // 执行指令。
  LogUtil.info('执行指令: tsc...')
  try {
    await ExecUtil.exec('tsc')
    LogUtil.debug('执行指令成功')
  } catch (e) {
    LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`)
    LogUtil.error(`\n${e.stack}`)
    throw e
  }
}
