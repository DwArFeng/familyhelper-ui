// noinspection DuplicatedCode

// 导入依赖模块。
const LogUtil = require('./util/log.js');
const ExecUtil = require('./util/exec.js');

// 运行脚本。
LogUtil.info('开始 lint...');
run()
    .then(() => {
        LogUtil.info('lint 完成');
    })
    .catch(e => {
        LogUtil.error(`lint 失败, 将抛出异常, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        throw e;
    })

async function run() {
    // 执行指令。
    LogUtil.info('执行指令: vue-cli-service lint...');
    try {
        await ExecUtil.exec('vue-cli-service lint');
        LogUtil.debug("执行指令成功")
    } catch (e) {
        LogUtil.error(`执行指令失败, 将抛出异常, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        throw e;
    }
}
