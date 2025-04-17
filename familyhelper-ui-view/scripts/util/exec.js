// noinspection DuplicatedCode

const childProcess = require('child_process')
const LogUtil = require('./log')

/**
 * @type {Promise<void>[]}
 */
const executingPromises = []

/**
 * Runs iterator function in parallel.
 *
 * @template T - The type of items in the data source
 * @param {number} maxConcurrency - The maximum concurrency.
 * @param {Array<{name: string, dependencies: string[]}>} packageInfos - The data source
 * @param {(item: T) => Promise<void>} iteratorFn - The iteratorFn
 * @returns {Promise<void[]>} - A Promise array containing all iteration results.
 */
async function runParallel(maxConcurrency, packageInfos, iteratorFn) {
  /**
   * @type {Map<string, Promise<void>>}
   */
  const promiseMap = new Map()

  /**
   * @type {Array<{name: string, dependencies: string[]}>}
   */
  const remainingPackageInfos = packageInfos.slice()

  /**
   * @type {Promise<void>[]}
   */
  const retPromises = []

  let loopCheck = 0
  while (remainingPackageInfos.length > 0) {
    if (++loopCheck > 100) {
      throw new Error('Circular dependencies detected')
    }
    outer: for (let i = 0; i < remainingPackageInfos.length; i++) {
      const packageInfo = remainingPackageInfos[i]
      const name = packageInfo.name
      const dependencies = packageInfo.dependencies
      // 如果包没有依赖，则直接执行。
      if (dependencies.length === 0) {
        // 在考虑最大并发数的情况下，构造 Promise 对象，并执行。
        LogUtil.info(`并行执行: ${name}...`)
        const p = iteratorFn(packageInfo)
        retPromises.push(p)
        await blockIfReachMaxConcurrency(maxConcurrency, p)
        promiseMap.set(packageInfo.name, p)
        remainingPackageInfos.splice(i, 1)
        break
      }
      // 如果包有依赖，如果被依赖的所有包都在执行中，则构造 Promise.all 对象，并执行。
      else {
        const dependentPromises = []
        for (const dependency of dependencies) {
          // 如果依赖的包还没有执行，则跳过。
          if (!promiseMap.has(dependency)) {
            continue outer
          }
          dependentPromises.push(promiseMap.get(dependency))
        }
        // 在考虑最大并发数的情况下，构造 Promise 对象，并执行。
        LogUtil.info(`并行执行: ${name}...`)
        const p = Promise.all(dependentPromises).then(() => iteratorFn(packageInfo))
        retPromises.push(p)
        await blockIfReachMaxConcurrency(maxConcurrency, p)
        promiseMap.set(packageInfo.name, p)
        remainingPackageInfos.splice(i, 1)
        break
      }
    }
  }

  return Promise.all(retPromises)
}

/**
 * Blocks the execution if the maximum concurrency is reached.
 *
 * @param {number} maxConcurrency - The maximum concurrency.
 * @param {Promise<void>} promise - The promise to execute.
 * @returns {Promise<void>} - A promise that resolves when the concurrency limit is not reached.
 */
async function blockIfReachMaxConcurrency(maxConcurrency, promise) {
  const e = promise.then(() => {
    executingPromises.splice(executingPromises.indexOf(e), 1)
  })
  executingPromises.push(e)
  LogUtil.debug(`当前并行线程数: ${executingPromises.length} / ${maxConcurrency}`)
  if (executingPromises.length >= maxConcurrency) {
    LogUtil.debug(`并行线程数达到最大值 ${maxConcurrency}, 等待任意线程执行完毕...`)
    await Promise.race(executingPromises)
    LogUtil.debug(
      `某线程执行完毕, 当前并行线程数: ${executingPromises.length} / ${maxConcurrency}, 结束等待`,
    )
  }
}

/**
 * Executes a command in a child process using spawn.
 *
 * @param {string} command - The command to execute.
 * @param {string[]} args - The arguments to pass to the command.
 * @param {string} [cwd] - The custom directory to run the command in.
 * @returns {Promise<void>} - A promise that resolves when the command has finished executing.
 */
async function spawn(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const _process = childProcess.spawn(command, args, {
      stdio: [
        'ignore', // stdin
        'inherit', // stdout
        'inherit', // stderr
      ],
      cwd: cwd || process.cwd(), // Set the custom directory or use the current working directory
      shell: process.platform === 'win32',
    })

    _process.stdout?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.info(c.replace(/\s+$/, ''))
      })
    })

    _process.stderr?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.warn(c.replace(/\s+$/, ''))
      })
    })

    _process.on('error', (error) => {
      reject(error)
    })

    _process.on('exit', (code) => {
      const ok = code === 0
      if (ok) {
        resolve()
      } else {
        reject(new Error('Failed to execute command'))
      }
    })
  })
}

/**
 * Executes a command in a child process using exec.
 *
 * @param {string} command - The command to execute.
 * @param {string} [cwd] - The custom directory to run the command in.
 * @returns {Promise<void>} - A promise that resolves when the command has finished executing.
 */
async function exec(command, cwd) {
  return new Promise((resolve, reject) => {
    // noinspection JSCheckFunctionSignatures
    const _process = childProcess.exec(command, {
      stdio: [
        'ignore', // stdin
        'inherit', // stdout
        'inherit', // stderr
      ],
      cwd: cwd || process.cwd(), // Set the custom directory or use the current working directory
      shell: process.platform === 'win32',
    })

    _process.stdout?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.info(c.replace(/\s+$/, ''))
      })
    })

    _process.stderr?.on('data', (chunk) => {
      // 按照换行符分割 chunk，并输出。
      chunk.split('\n').forEach((c) => {
        LogUtil.warn(c.replace(/\s+$/, ''))
      })
    })

    _process.on('error', (error) => {
      reject(error)
    })

    _process.on('exit', (code) => {
      const ok = code === 0
      if (ok) {
        resolve()
      } else {
        reject(new Error('Failed to execute command'))
      }
    })
  })
}

// 导出模块。
module.exports = { runParallel, spawn, exec }
