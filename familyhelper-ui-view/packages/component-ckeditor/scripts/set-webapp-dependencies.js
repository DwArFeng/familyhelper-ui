// 导入依赖模块。
const LogUtil = require('./util/log.js');
const ExecUtil = require('./util/exec.js');

// 运行脚本。
LogUtil.info('设置 webapp 依赖开始...');
run()
    .then(() => {
        LogUtil.info('设置 webapp 依赖完成');
    })
    .catch(e => {
        LogUtil.error(`设置 webapp 依赖失败, 将抛出异常, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        throw e;
    })

async function run() {
    // 执行指令。
    LogUtil.info('执行指令: webpack --mode production...');
    try {
        await ExecUtil.exec('webpack --mode production');
        LogUtil.debug("执行指令成功")
    } catch (e) {
        LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        throw e;
    }
}
