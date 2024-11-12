const LogUtil = require('./util/log.js');
const {cpus} = require("node:os");
const PackageUtil = require('./util/package');
const ExecUtil = require('./util/exec');
const PathUtil = require('./util/path');
const {readFileSync} = require('node:fs');

// 运行脚本。
LogUtil.info('开始构建...');
run()
    .then(() => {
        LogUtil.info('构建完成');
    })
    .catch(e => {
        LogUtil.error(`构建失败, 将异常退出, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        process.exit(1);
    })

async function run() {
    // 构建所有包。
    await executePackages(PackageUtil.packageInfos)
}

/**
 * Executes all the targets in parallel.
 *
 * @param {Array<{name: string, dependencies: string[]}>} packageInfos - An array of package names to execute.
 * @returns {Promise<void>} - A promise representing the execute process.
 */
async function executePackages(packageInfos) {
    await ExecUtil.runParallel(cpus().length, packageInfos, executeSinglePackage)
}

/**
 * Executes the specified package.
 *
 * @param {{name: string, dependencies: string[]}} packageInfo - The package's name to execute.
 * @returns {Promise<void>} - A promise representing the execute process.
 */
async function executeSinglePackage(packageInfo) {
    // 获取包名。
    const packageName = packageInfo.name;

    // 获取 package.json 文件。
    const pkg = JSON.parse(readFileSync(PathUtil.parsePath(`packages/${packageName}/package.json`), 'utf-8'))

    // 如果 package.json 文件中不存在脚本，则跳过。
    if (!pkg.scripts || !pkg.scripts['build']) {
        return
    }

    // 执行构建脚本。
    try {
        await ExecUtil.spawn(
            'pnpm',
            ['build'],
            PathUtil.parsePath(`packages/${packageName}`),
        )
    } catch (e) {
        LogUtil.error(`包 ${packageName} 执行构建脚本失败, 将抛出异常, 异常信息如下: ${e.message}`);
        LogUtil.error(`\n${e.stack}`);
        throw e;
    }
}
